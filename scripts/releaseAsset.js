exports.getRelease = async function (github, context, releaseTagName) {
    var response = null;
    var release = null;
    const re = new RegExp('(v[0-9]+\.[0-9]+\.[0-9]+)', 'g');

    if (releaseTagName == 'latest') {
        response = await github.rest.repos.getLatestRelease({
            owner: context.repo.owner,
            repo: context.repo.repo,
        });
        release = response['data']
    }
    else if (re.test(releaseTagName)) {
        response = await github.rest.repos.getReleaseByTag({
            owner: context.repo.owner,
            repo: context.repo.repo,
            tag: releaseTagName,
        });
        release = response['data']
    }
    else {
        response = await github.rest.repos.listTags({
            owner: context.repo.owner,
            repo: context.repo.repo
        })
        var tags = response['data']
        var releaseTag = null
        for (const tag of tags) {
            if (tag['name'] === releaseTagName) {
                releaseTag = tag
            }
        }
        console.log(releaseTag)
        if (releaseTag === null) {
            throw "No release tag found with that name!"
        }
        if (!(re.test(releaseTag['name']))) { // lets reduce the number of tags before finding the one we want
            var filteredTags = []
            for (const tag of tags) {
                if (re.test(tag['name'])) {
                    filteredTags.push(tag)
                }
            }
            tags = filteredTags
            for (const tag of tags) {
                if (tag['commit']['sha'] === releaseTag['commit']['sha']) {
                    releaseTag = tag
                    break
                }
            }
        }
        if (!(re.test(releaseTag['name']))) {
            throw `No version tag found for release tag: ${releaseTag['name']}`
        }
        response = await github.rest.repos.getReleaseByTag({
            owner: context.repo.owner,
            repo: context.repo.repo,
            tag: releaseTag['name'],
        });
        release = response['data']
    }
    return release
}

exports.uploadReleaseAsset = async function (github, context, releaseTagName, fileName) {
    var response = null
    response = await github.rest.repos.getReleaseByTag({
        owner: context.repo.owner,
        repo: context.repo.repo,
        tag: releaseTagName,
    });
    const release = response['data']
    const releaseId = release['id']

    const fs = require('fs');
    const fileData = fs.readFileSync(fileName);
    response = await github.rest.repos.uploadReleaseAsset({
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

exports.downloadReleaseAsset = async function (github, context, releaseTagName, assetName) {
    var response = null;
    const release = await module.exports.getRelease(github, context, releaseTagName)
    const releaseId = release['id']
    console.log(`Identified Release ID: ${releaseId}`)

    response = await github.rest.repos.listReleaseAssets({
        owner: context.repo.owner,
        repo: context.repo.repo,
        release_id: releaseId,
    });
    console.log(response)
    const releaseAssets = response['data']
    var assetId = null
    for (const asset of releaseAssets) {
        if (asset['name'] == assetName) {
            assetId = asset['id']
            break
        }
    }
    response = await github.rest.repos.getReleaseAsset({
        headers: {
            accept: 'application/octet-stream'
        },
        owner: context.repo.owner,
        repo: context.repo.repo,
        asset_id: assetId,
    });
    const assetData = response['data']
    const fs = require('fs');
    try {
        fs.writeFileSync(assetName, Buffer.from(assetData));
        // file written successfully
    } catch (err) {
        console.error(err);
    }
    return response
}