exports.triggerWorkflow = async function (github, context, workflowId, ref, inputs) {
    const response = await github.rest.actions.createWorkflowDispatch({
        owner: context.repo.owner,
        repo: context.repo.repo,
        workflow_id: workflowId,
        ref: ref, // 'refs/tags/latest-rc',
        inputs: inputs
    })
    return response
}

exports.buildReleaseList = async function (github, context, include_unapproved = false) {
    var response = null
    response = await github.rest.repos.listReleases({
        owner: context.repo.owner,
        repo: context.repo.repo
    });
    const releases = response['data']
    var releaseList = []
    var releaseTag = null
    var listEntry = null
    for (const release of releases) {
        if ((release.draft == false && release.prerelease == false) || include_unapproved == true) {
            releaseTag = release['tag_name']
            listEntry = '- ' + releaseTag + '\n          '
            releaseList.push(listEntry)
        }
    }
    releaseList = releaseList.join("")
    return releaseList
}

exports.listWorkflows = async function (github, context) {
    var response = null
    response = await github.rest.actions.listRepoWorkflows({
        owner: context.repo.owner,
        repo: context.repo.repo
    });
    workflows = response.data.workflows
    return workflows
}

function loadingBarStatus(current, max) {
    message = `Loading ${current} of ${max}`;
    console.log(message)
}

async function deleteRun(github, context, id) {
    response = github.rest.actions.deleteWorkflowRun({
        owner: context.repo.owner,
        repo: context.repo.repo,
        run_id: id
    });
    return response
}

exports.cleanAllWorkflowRunHistory = async function (github, context) {
    var response = null
    response = await github.paginate(
        github.rest.actions.listWorkflowRunsForRepo,
        {
            owner: context.repo.owner,
            repo: context.repo.repo,
            per_page: 100
        },
        (response) => response.data.map((run) => run.id)
    );

    console.log(`Got ${response.length} WF Runs to delete`)
    var promises = []

    for (const runId of response) {
        response = github.rest.actions.deleteWorkflowRun({
            owner: context.repo.owner,
            repo: context.repo.repo,
            run_id: runId
        });
        promises.push(response)
    }
    functionResponse = await Promise.all(promises)
    return functionResponse
}

exports.cleanWorkflowRuns = async function (github, context, workflow_id) {
    var response = null
    response = await github.paginate(
        github.rest.actions.listWorkflowRuns,
        {
            owner: context.repo.owner,
            repo: context.repo.repo,
            workflow_id: workflow_id,
            per_page: 100
        },
        (response) => response.data.map((run) => run.id)
    );

    console.log(`Got ${response.length} WF Runs to delete`)
    var promises = []

    for (const runId of response) {
        response = github.rest.actions.deleteWorkflowRun({
            owner: context.repo.owner,
            repo: context.repo.repo,
            run_id: runId
        });
        promises.push(response)
    }
    functionResponse = await Promise.all(promises)
    return functionResponse
}
