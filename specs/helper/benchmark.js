const benchmark = (numRuns, fn) => {
    const durations = [];
    for (let i = 0; i < numRuns; i++) {
        const before = Date.now();
        fn();
        const after = Date.now();
        durations.push(after - before);
    }

    const sumDurations = durations.reduce((accum, val) => accum + val, 0);
    return sumDurations / numRuns;
};

export default benchmark;
