const { release } = require('os')

exports.getLatestCommit = async function (github, context, branch) {
    const response = await github.rest.repos.listCommits({
        owner: context.repo.owner,
        repo: context.repo.repo,
        sha: branch
    })
    return response['data'][0]
}

exports.listTags = async function (github, context) {
    const response = await github.rest.repos.listTags({
        owner: context.repo.owner,
        repo: context.repo.repo
    })
    return response['data']
}

exports.getTagByName = async function (github, context, tagName) {
    const tags = module.exports.listTags(github, context);
    const tag = tags.then(function (tags) {
        for (const tag of tags) {
            if (tag['name'] === tagName) {
                var response = tag
            };
        };
        return response
    });
    return tag
}

exports.getVersionTagFromReferenceTag = async function (github, context, referenceTag) {
    const referenceTagName = await module.exports.getTagByName(github, context, referenceTag)
    console.log(referenceTagName)
    const tags = await module.exports.listTags(github, context)
    var versionTag = null
    for (const tag of tags) {
        if (tag['commit']['sha'] === referenceTag['commit']['sha'] && tag['name'].startsWith('v')) {
            versionTag = tag
        };
    };
    return versionTag
}

exports.getLatestRelease = async function (github, context) {
    const response = await github.rest.repos.getLatestRelease({
        owner: context.repo.owner,
        repo: context.repo.repo
    })
    release = response['data']
    return release
}

exports.getReleaseByTag = async function (github, context, releaseTag) {
    tagName = releaseTag['name']
    const response = await github.rest.repos.getReleaseByTag({
        owner: context.repo.owner,
        repo: context.repo.repo,
        tag: tagName,
    });
    return response
}

exports.getReleaseFromReferenceTag = async function (github, context, referenceTag) {
    const releaseTag = await module.exports.getVersionTagFromReferenceTag(github, context, referenceTag)
    const release = await module.exports.getReleaseByTag(github, context, releaseTag)
    return release['data']
}

exports.createReleaseCandidate = async function (github, context, tagName) {
    const response = await github.rest.repos.createRelease({
        owner: context.repo.owner,
        repo: context.repo.repo,
        tag_name: tagName,
        name: 'Release Candidate  - ' + tagName,
        body: 'Automatically Generated Release Notes:',
        generate_release_notes: true,
        prerelease: true
    })
    return response
}

exports.approveRelease = async function (github, context, release) {
    const response = github.rest.repos.updateRelease({
        owner: context.repo.owner,
        repo: context.repo.repo,
        release_id: release['id'],
        name: 'Release - ' + release['tag_name'],
        prerelease: false
    });
}

exports.getLatestRelease = async function (github, context) {
    const response = await github.rest.repos.getLatestRelease({
        owner: context.repo.owner,
        repo: context.repo.repo
    });
    return response['data']
}

exports.uploadReleaseAsset = function (github, context, release, fileName) {
    const fs = require('fs');
    const fileData = fs.readFileSync(fileName);
    const releaseId = release['id']
    const response = github.rest.repos.uploadReleaseAsset({
        headers: {
            'Content-Type': 'application/zip'
        },
        owner: context.repo.owner,
        repo: context.repo.repo,
        release_id: releaseId,
        name: fileName,
        data: fileData
    })
    return response
}

exports.downloadReleaseAsset = async function (github, context, releaseTagName, assetName, fileName) {
    const releaseTag = await module.getTagByName(github, context, releaseTagName)
    const release = await module.exports.getReleaseByTag(github, context, releaseTag);
    const releaseId = release['id']

    const assetInfo = releaseId.then(function (releaseId) {
        return module.exports.getReleaseAsset(github, context, releaseId, assetName);
    });

    const data = assetInfo.then(function (assetInfo) {
        return module.exports.getAssetData(github, context, assetInfo['id']);
    });

    data.then((data) => {
        module.exports.writeToFile(data, fileName)
    });
    return
}

exports.getReleaseFromTagName = async function (github, context, referenceTagName) {
    var response = null
    response = await github.rest.repos.listReleases({
        owner: context.repo.owner,
        repo: context.repo.repo
    });
    const releases = response.data
    var release = null
    for (const foundRelease of releases) {
        if (foundRelease.tag_name == referenceTagName) {
            release = foundRelease
        }
    }
    if (release.draft == true || release.prerelease == true) {
        release.prodReady = true
    }
    else {
        release.prodReady = false
    }
    return release
}

exports.getLatestVersionTag = async function (github, context) {
    const versionHelper = require("./versionHelper")
    var response
    response = await github.rest.repos.listTags({
        owner: context.repo.owner,
        repo: context.repo.repo
    })
    const tags = response['data']
    if (tags.length === 0) {
        return null
    }
    for (const tag of tags) {
        if (versionHelper.checkIfValidVersionTag(tag) === true) {
            return tag.name
        }
    }
}


