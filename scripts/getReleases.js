exports.getLatestRelease = async function (github, context) {
    var response = null
    response = await github.rest.repos.listReleases({
        owner: context.repo.owner,
        repo: context.repo.repo
    });
    const releases = response.data
    var latestRelease = releases[0]
    for (const release of releases) {
        if (Date.parse(release.created_at) > Date.parse(latestRelease.created_at)) {
            latestRelease = release
        }
    }
    return latestRelease
}