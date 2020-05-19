d3.csv('CL.csv', function(d) {
    console.log(d)
    return {
        location: d.Finalist,
        character: d.Winner,
        words: 1
    }
}).then(data => {
    console.log(data)
})

    // data.forEach(element => {
    //     location = element.Finalist

    // });
