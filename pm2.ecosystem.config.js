module.exports = {
    apps: [
        {
            name: 'madira-worker-submissions',
            script: 'node',
            args: 'scripts/workerProcess.cjs',
            watch: false,
            autorestart: true,
            max_restarts: 10,
            env: {
                NODE_ENV: 'production',
            },
        },
    ],
}
