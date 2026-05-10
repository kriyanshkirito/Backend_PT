import express from 'express';
import axios from 'axios';



const router=express.Router();

router.get("/",(req,res)=>{
    res.render("index");
});

// routes search anime

router.get("/search",async(req,res)=>{
    const query=req.query.q;
    try {
        const response=await axios.get(`https://api.jikan.moe/v4/anime?q=${query}`);
        res.render("index",{
            animeList:response.data.data,
            
        });
        console.log(response);
    } catch (error) {
        console.error("error fething data",error.message);
        res.send("Error fething data");
    }
});

//anime detail route
// Anime detail route
router.get("/anime/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime/${id}`);
        res.render("anime", {
            anime: response.data.data,
        });
    } catch (error) {
        console.error("Error fetching anime detail", error.message);
        res.send("Error fetching anime detail");
    }
});

export default router;