const functions = require('firebase-functions');
const mkdirp = require('mkdirp-promise');
const gcs = require('@google-cloud/storage')();
const exec = require('child-process-promise').exec;
const ffmpeg = require('fluent-ffmpeg');
const ffmpeg_static = require('ffmpeg-static');

const MP4_EXTENSION = 'mp4';
const TEMP_LOCAL_FOLDER = '/tmp/';



/*
*
*/
exports.webm_to_mp4 = functions.storage.object().onChange(event => {
  const object = event.data;
  const filePath = object.name;
  const filePathSplit = filePath.split('/');
  const fileName = filePathSplit.pop();
  const baseFileName = fileName.split('.').slice(0,-1).join('.')
  const fileDir = filePathSplit.join('/') + (filePathSplit.length > 0 ? '/' : '');

  const MP4FilePath = `${fileDir}${baseFileName}.${MP4_EXTENSION}`;
  const tempLocalDir = `${TEMP_LOCAL_FOLDER}${fileDir}`;
  const tempLocalFile = `${tempLocalDir}${fileName}`;
  const tempLocalMP4File = `${TEMP_LOCAL_FOLDER}${MP4FilePath}`;

  if(!object.contentType.startsWith('video/')){
    console.log('Item ', fileName, 'is not a video.')
    return
  }
  if(object.contentType.startsWith('video/mp4')){
    console.log('Item ', filename, 'Is already an mp4, no need to convert.')
    return
  }


  console.log("Time to convert!");
});
