{
    baseUrl: '.',
    name: 'almond',
    paths: {
        sequencer: "../Sequencer"
    },
    include: ['sequencer/sequencer'],
    insertRequire: ['sequencer/sequencer'],
    out: 'sequencer-built.js',
    wrap: {
        startFile: 'start.frag',
        endFile: 'end.frag'
    }
}