function NoReNum()//用来产生不重复的数字，范围0-count
{
    let originalArray=new Array;//原数组
    //打乱数组并且返回新的数组 
    this.makeNum = function(count)
    {
        
        //给原数组originalArray赋值 
        for (let i=0;i<count;i++)
        { 
            originalArray[i]=i+1; 
        } 

        originalArray.sort(function()
        {   
            return 0.5 - Math.random(); 
        }); 

        //console.log(originalArray)
        return originalArray;
    };
}
module.exports = NoReNum;