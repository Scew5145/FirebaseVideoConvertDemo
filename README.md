# Auto-Convert webm videos to mp4
Quick demo for converting mp4 --> webm using firebase functions and fluent-ffmpeg. All major code can be found in [functions/index.js](functions/index.js)



Installation and Deployment
-----
Create a new firebase project on the Firebase Console.

1. Deploy the project by using `firebase init` and `firebase deploy` in the directory. 

2. Go to the Firebase Storage tab in the firebase console, and upload any webm file. 

Known Issues
-----

Firebase Functions have a timeout that's normally set to 1 minute. 
Due to the slow conversion speed of most video types, it's somewhat nessecary to increase the timeout duration.
 
To increase the duration: 
* Go to the [Cloud Function Console](https://console.cloud.google.com/functions/list)
* Click select when prompted to select a project and pick your newly created firebase project
* Click the three dots on the right next to the function, and click Test Function
* Click Edit
* Change Timeout to a bigger number (I chose 180 seconds, but more or less may be better)
