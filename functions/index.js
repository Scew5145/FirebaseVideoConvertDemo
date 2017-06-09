const functions = require('firebase-functions');
const mkdirp = require('mkdirp-promise');
const gcs = require('@google-cloud/storage')();
const Promise = require('bluebird');
const ffmpeg = require('fluent-ffmpeg');
const ffmpeg_static = require('ffmpeg-static');

const MP4_EXTENSION = 'mp4';
const TEMP_LOCAL_FOLDER = '/tmp/';



/*
*
*/

//Helper function for changing the ffmpeg command into a promise so that the function will properly wait for it to finish.
//Source: https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/issues/710

function promisifyCommand (command) {
    return new Promise( (cb) => {
        command
        .on( 'end',   ()      => { cb(null)  } )
        .on( 'error', (error) => { cb(error) } )
        .run();
    })
}
//Conversion function for changing webms (or other video types, maybe?) into mp4s.
exports.webm_to_mp4 = functions.storage.object().onChange(event => {
  const object = event.data;
  const filePath = object.name;
  const filePathSplit = filePath.split('/');
  const fileName = filePathSplit.pop();
  const fileNameSplit = fileName.split('.');
  const fileExtension = fileNameSplit.pop();
  const baseFileName = fileNameSplit.join('.');
  const fileDir = filePathSplit.join('/') + (filePathSplit.length > 0 ? '/' : '');

  const MP4FilePath = `${fileDir}${baseFileName}.${MP4_EXTENSION}`;
  const tempLocalDir = `${TEMP_LOCAL_FOLDER}${fileDir}`;
  const tempLocalFile = `${tempLocalDir}${fileName}`;
  const tempLocalMP4File = `${TEMP_LOCAL_FOLDER}${MP4FilePath}`;


  //Type Checking for the uploaded item
  if(object.contentType != 'video/webm'){
    console.log('Item ', fileName, 'is not a webm video.')
    return
  }

  //Make sure the event isn't a move or deletion event
  if (object.resourceState === 'not_exists') {
    return;
  }

  //Make the temp directory
  return mkdirp(tempLocalDir).then(() => {
    console.log('Directory Created')
    //Download item from bucket
    const bucket = gcs.bucket(object.bucket);
    return bucket.file(filePath).download({destination: tempLocalFile}).then(() => {
      console.log('file downloaded to convert. Location:', tempLocalFile)
      cmd = ffmpeg({source:tempLocalFile})
                   .setFfmpegPath(ffmpeg_static.path)
                   .inputFormat(fileExtension)
                   .output(tempLocalMP4File)
                   //Uncomment to see frame progress. Change to progress.percent to see bad % completed estimates
                   /*.on('progress', function(progress) {
                     console.log('Processing: ' + progress.frames + ' frames completed');
                   });*/
      cmd = promisifyCommand(cmd)
       return cmd.then(() => {
        console.log('mp4 created at ', tempLocalMP4File)
        //Just the upload left
        return bucket.upload(tempLocalMP4File, {
            destination: MP4FilePath
        }).then(() => {
          console.log('mp4 uploaded at', filePath);
        });
      })
    });
  });

});
