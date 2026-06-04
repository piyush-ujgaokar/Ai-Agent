import express from 'express'
import morgan from 'morgan'
import fs from 'fs'


const app=express()
app.use(express.json())
app.use(morgan('dev'))

const WORKING_DIR='/workspace'


app.get('/',(req,res)=>{
    res.status(200).json({
        message:'Hello from the Sandbox agent server',
        status:'ok'
    })
})

app.get('/list-files',async(req,res)=>{
    const elements=await fs.promises.readdir(WORKING_DIR);

    return res.status(200).json({
        message:'Elements in the working directory',
        elements
    })

})



export default app