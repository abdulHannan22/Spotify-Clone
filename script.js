console.log("dsvvs")
let currentsong = new Audio();
let songs;
let currFolder;
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
async function getsongs(folder) {

    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    //console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songul.innerHTML = ""
    // Show all the songs in the playlist
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `
        <li>
                            <img class="invert" src="images/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Song Artist</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="images/play.svg" alt="">
                            </div>
                        </li>`;
    }

    // audio.addEventListener("loaddata",()=>{
    //     let duration = audio.duration;
    //     console.log(duration)
    // })
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            //console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playmusic(e.querySelector(".info").firstElementChild.innerHTML)

        })
    })
    return songs

}

const playmusic = (track, pause = false) => {
    // audio.volume = 0.5 set volumn to 50%
    // audio.playbackRate = 1.5 set speed 1.5x

    currentsong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentsong.play()
        play.src = "images/pause.svg"

    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00 "
}

//display all the albums on the page
async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1);
            //get the meta data of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <img src="greenplay.png" alt="" srcset="">
                            <!-- <svg width="24" height="24" viewBox="0 0 24 24" fill="green" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round"/>
                                </svg> -->
                                
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
            console.log(response)
        }
    }

    //load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            playmusic(songs[0])

        })
    })

}
async function main() {
    //get the list of allsongs
    await getsongs("songs/ncs")
    playmusic(songs[0], true)

    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "images/pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "images/play.svg"

        }
    })
    // Listen for timeupdate event
    currentsong.addEventListener("timeupdate", () => {
        // console.log(currentsong.currentTime, currentsong.duration)
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    })
    //add event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100;

    })

    //add an event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })


    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
        console.log("done")
    })

    //add an event listener to previous

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        console.log(index)
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])

        }
    })
    //add an event listener to next
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        console.log(index)
        if ((index + 1) > length) {
            playmusic(songs[index + 1])
        }
        // else{
        //     playmusic(songs[index-index]);
        // }
    })

    //add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log(e.target.value)
        currentsong.volume = parseInt(e.target.value) / 100
    })
    //add eventlistener to track for mute
    document.querySelector(".volume img").addEventListener("click", e=>{
        if (e.target.src == "http://127.0.0.1:5500/images/volume.svg"){
            e.target.src = e.target.src.replace("http://127.0.0.1:5500/images/volume.svg","http://127.0.0.1:5500/images/mute.svg")
            currentsong.volume  = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else{
            e.target.src = e.target.src.replace("http://127.0.0.1:5500/images/mute.svg","http://127.0.0.1:5500/images/volume.svg")
            currentsong.volume = 1
            document.querySelector(".range").getElementsByTagName("input")[0].value = 100

        }
    })
}
main()
displayAlbums()