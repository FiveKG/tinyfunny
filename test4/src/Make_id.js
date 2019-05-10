//获得一个1001-9999的账号ID,单例模式
class Make_id
{    
    constructor()
    {
        this.originalArray=new Array;
        this.instance = null;
        for (let i=1001, j =0;i<9999;i++,j++)
        { 
            this.originalArray[j]=i+1; 
        } 
        this.originalArray.sort(function()
        {   
            return 0.5 - Math.random(); 
        }); 

    }
    static get_instance()
    {//调用该静态方法获取实例
        if(this.instance)
        {

        }
        else
        {
            this.instance = new Make_id();
        }
        return this.instance;
    }
    get_id()
    {
        return this.originalArray.pop()
    };
}
module.exports = Make_id;


//test
// let id = Make_id.get_instance();
// let id2 =Make_id.get_instance();
// console.log(id2===id)
// for(let i=0;i<100;i++){
//     console.log(id.get_id());
// }