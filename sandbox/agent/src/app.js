import express from 'express'
import morgan from 'morgan'
import fs from 'fs'
import path from 'path'


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
    
    const listFiles=async(dir, baseDir)=>{
        const entries=await fs.promises.readdir(dir,{withFileTypes:true})
        const files=[]

        for(const entry of entries){
            const fullPath=path.join(dir,entry.name)
            const relativePath=path.relative(baseDir,fullPath)

            if(entry.isDirectory() && ['node_modules','.git','dist'].includes(entry.name)){
                continue
            }

            if(entry.isDirectory()){
                files.push(...await listFiles(fullPath,baseDir))
            }else{
                files.push(relativePath)
            }
        }

        return files
    }

    try{
        const files=await listFiles(WORKING_DIR,WORKING_DIR)
        res.status(200).json({
            message:'Files Listed Successfully',
            files
        })
    }catch(err){
        res.status(500).json({
            message:`Error listing files: ${err.message}`,
            status:'error'
        })
    }

})

app.get('/read-files',async(req,res)=>{
    const files=req.query.files

    if(!files){
        return res.status(400).json({
            message:'Files query parameter is required',
            status:'error'
        })
    }

    const fileList=files.split(',');

    const fileContents={}

    const results=await Promise.all(fileList.map(async(file)=>{
        const filePath=path.join(WORKING_DIR,file)
        try{
            const content=await fs.promises.readFile(filePath,'utf-8') 

            return {
                [filePath.replace(WORKING_DIR ,'')]:content
            }
        }catch(err){
            return {
                [filePath.replace(WORKING_DIR ,'')]:`Error reading file: ${err.message}`
             }
         }
        }))

       res.status(200).json({
        message:'file contents',
        files:results
         })

})

app.patch('/update-files',async (req,res)=>{

    const updates=req.body.updates

    if(!updates || !Array.isArray(updates)){
        return res.status(400).json({
            message:'Updates must be an array of {file,content} objects',
            status:'error'
        })
    }

    const results=await Promise.all(updates.map(async(update)=>{
        const {file,content} =update
        const filePath=path.join(WORKING_DIR,file)
        try{
            await fs.promises.writeFile(filePath,content,'utf-8')
            return {
                [filePath]:'File updated successfully'
            }
        }catch(err){
            return {
                [filePath]:`Error updating file: ${err.message}`
            }
        }
    }))

    res.status(200).json({
        message:'File update results',
        results
    })


})

app.post('/create-files',async (req,res)=>{
    const files=req.body.files

    if(!files || !Array.isArray(files)){
        return res.status(400).json({
            message:'Files must be an array of {file,content} objects',
            status:'error'
        })
    }

    const results=await Promise.all(files.map(async(fileObj)=>{
        const {file,content}=fileObj
        const filePath=path.join(WORKING_DIR,file)
        try{
            await fs.promises.mkdir(path.dirname(filePath),{recursive:true})
            await fs.promises.writeFile(filePath,content,'utf-8')
            return {
                [filePath]:'File created successfully'
            }
        }catch(err){
            return {
                [filePath]:`Error creating file: ${err.message}`
            }
        }
    }))

    res.status(200).json({
        message:'File creation results',
        results
    })

})




export default app