exports.printMsg = function () {
    console.log("this is a message from a module!")
}

exports.createVersionDateString = function () {
    var today = new Date();
    var dd = today.getDate()//.padStart(2, '0');
    var mm = today.getMonth() + 1//.padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    arr = [yyyy, mm, dd, 0];
    return arr
}

exports.checkIfValidVersionTag = function (tag) {
    var tagName = tag.name
    const re = new RegExp('v((20)[0-9]{2}\.[0-1]{1}[0-9]{1}\.[0-3][0-9](\.[0-9]*)*)', 'g');
    tagName = tagName.match(re);
    if (tagName == null) {
        return false
    }
    else {
        return true
    }
}

exports.regexVersionFromString = function (versionString) {
    if (versionString === "0") {
        return "0"
    }
    const re = new RegExp('v((20)[0-9]{2}\.[0-1]{1}[0-9]{1}\.[0-3][0-9](\.[0-9]*)*)', 'g');
    var version = versionString.match(re);
    if (version == null) {
        return null
    }
    if (version.length == 1) {
        version = version[0]
    }
    else {
        version = null
    }
    return version
}

exports.decomposeVersionString = function (versionString) {
    versionString = versionString.replace("v", "")
    var arr = versionString.split(".");
    arr.forEach(function (part, index) {
        this[index] = parseInt(this[index])
    }, arr);
    return arr
}

exports.incrementVersion = async function (oldVersion) {
    console.log(`oldVersion: ${oldVersion}`)
    oldVersion = module.exports.decomposeVersionString(oldVersion)
    var newVersion = module.exports.createVersionDateString();
    if (oldVersion[0] == newVersion[0]) {
        if (oldVersion[1] == newVersion[1]) {
            if (oldVersion[2] == newVersion[2]) {
                newVersion[3] = oldVersion[3] + 1
            }
        }
    }
    newVersion[0] = String(newVersion[0])
    newVersion[1] = String(newVersion[1]).padStart(2, '0')
    newVersion[2] = String(newVersion[2]).padStart(2, '0')
    newVersion = "v" + newVersion.join(".");
    console.log(`newVersion: ${newVersion}`);
    return newVersion
}

exports.compareVersions = function (v1, v2) {
    var v1 = module.exports.regexVersionFromString(v1)
    var v2 = module.exports.regexVersionFromString(v2)
    if (v1 == null) {
        v1 = [0, 0, 0]
    };
    if (v2 == null) {
        v2 = [0, 0, 0]
    };
    if (v1.length != v2.length) {
        throw "Array Lengths must be the same!"
    };
    var result = null;
    for (const x of Array(3).keys()) {
        if (v1[x] == v2[x]) {
            continue
        }
        else if (v1[x] > v2[x]) {
            result = v1
            break
        }
        else if (v1[x] < v2[x]) {
            result = v2
            break
        }
    }
    if (result == null) {
        result = v1
    }
    result = "v" + result.join(".");
    return result
}


