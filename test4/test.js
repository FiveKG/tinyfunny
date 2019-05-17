let a={1:'11',2:'222'}
let b = new Map()
b.set(1,'111')
b.set(3,'31')
b.set(2,'121')


b.forEach(function(key,value){
    console.log(key+value)
})