var ShowMem = function() {
    let mem = process.memoryUsage();
    let total = (mem.rss/1024/1024)
    console.log('Process:' + ' total ' +total);
    console.log('----------------------------------------');
    return total
};

module.exports = ShowMem;
