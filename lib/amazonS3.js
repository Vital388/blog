/**
 * Created by Lollypop on 24.12.2015.
 */
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./lib/amazonConf.json');
AWS.config.region = 'eu-central-1';
var s3obj = new AWS.S3({params: {Bucket: 'fvblog',ACL:'public-read'}});
module.exports=s3obj;