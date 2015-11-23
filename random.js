/**
 * Created by Lollypop on 23.11.2015.
 */
var crypto = require('crypto');
var path = require('path');
var b64Safe = {'/': '_', '+': '-'};
var FILE_EXT_RE = /(\.[_\-a-zA-Z0-9]{0,16}).*/;
function randoName(filename) {
    var ext = path.extname(filename).replace(FILE_EXT_RE, '$1');
    var name = randoString(18) + ext;
    return name;
}

function randoString(size) {
    return rando(size).toString('base64').replace(/[\/\+]/g, function (x) {
        return b64Safe[x];
    });
}

function rando(size) {
    try {
        return crypto.randomBytes(size);
    } catch (err) {
        return crypto.pseudoRandomBytes(size);
    }
}
module.exports=randoName;