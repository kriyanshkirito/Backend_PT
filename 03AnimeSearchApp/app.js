import express from 'express'
import {fileURLToPath} from 'url'
import path from 'path'
import animeRoutes from './routes/anime.js'

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);  

const app=express();

// Setup view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));  // if we were using common js thne we can directly use above only not need to define this

// routes se api nikalana 
app.use("/",animeRoutes);  // routes upar staic folder agar nahi hoga to we will not be able to view page

// setup static folder
app.use(express.static(path.join(__dirname,'public'))); // directly not defined so we have to use path function

app.listen(8000,()=>{
    console.log(`server running on port https://localhost:${8000}`);
});

