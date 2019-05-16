class Send_rec_format
{
    constructor()
    {   
        this.result = {'operate':null,'result':null,'data':null}
    }
    
    set(operate,result,data)
    {
        this.result['operate']= operate
        this.result['result'] = result
        this.result['data'] = data
    }
    get()
    {
        return this.result
    }
}
module.exports = Send_rec_format