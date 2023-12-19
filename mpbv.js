// Mountain Project Beta Videos
// Main content script
// Version 1.0

//Decalre constants
const commentListIdBase =  'comments-Climb-Lib-Models-Route-';
const linkRe = /youtu\.*be\.*\w*\/(?:watch\?v=)?([^\?&\s]*)/im;
const baseEmbedUrl = 'https://www.youtube.com/embed/';

//Video class
class Video {
    constructor(url, author, comment) {
        this.url = url;
        this.author = author;
        this.comment = comment;
    }
}

//Get element ids
let routeId = document.URL.split('/')[4];
let commentListId =  commentListIdBase.concat(routeId);

function getVids() {
    //Get html of all comments
    let commentListDiv = document.getElementById(commentListId)
    let comments = commentListDiv.getElementsByTagName("table");

    let videoList = [];

    for (const comment of comments) {
        let commentBodyDiv = comment.querySelector(".comment-body");
        if (commentBodyDiv == null || commentBodyDiv.children.length === 0) {
            continue;
        }
        let commentBody = commentBodyDiv.children[0];
        let links = commentBody.getElementsByTagName("a");
        if (links.length === 0) {
            continue;
        }
        //Find links that are youtube vids and add them and comment data to list
        let mutipleVideos = false;
        for (const link of links) {
            let href = link.getAttribute('href');
            let ytLinks = linkRe.exec(href);
            if (ytLinks != null) {
                let url = baseEmbedUrl.concat(ytLinks[1]);
                link.classList.add("mpbv-hidden");
                let author,
                        commentText
                    if (mutipleVideos) { //For comments with mutiple video after the first video clone the comment and author html
                        author = comment.querySelectorAll(".bio")[0].cloneNode(true);
                        commentText = comment.querySelectorAll(".comment-body")[0].cloneNode(true);
                    } else {
                        author = comment.querySelectorAll(".bio")[0];
                        commentText = comment.querySelectorAll(".comment-body")[0];  
                    }
                    let video = new Video(url,author,commentText);
                    comment.classList.add("mpbv-hidden");
                    videoList.push(video);
                    mutipleVideos = true;
                }
            }

    };
    
    if (videoList.length >= 1) {
        //Create fragment to inject into DOM
        let videosSection = document.createDocumentFragment();

        //Videos section and container div for individual videos
        let videosSectionDiv = document.createElement('div');
        videosSectionDiv.id = "mpbv-container";
        videosSectionDiv.innerHTML = "<h2>Videos</h2>";
        let videoDiv = document.createElement('div');
        videoDiv.id = "mpbv-videos";
        videosSectionDiv.append(videoDiv); 
        videosSection.append(videosSectionDiv);

        //Create each video element
        for (const video of videoList) {
            let videoContainer = document.createElement('div');
            videoContainer.className = "mpbv-video-contianer";
            var iframe = document.createElement('iframe');
            iframe.src = video.url;
            iframe.className = "mpbv-video";
            iframe.allow = "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
            iframe.title = "YouTube video player";
            iframe.setAttribute('allowFullScreen', '');
            videoContainer.appendChild(iframe);
            //Move author and comment html to below video or add if a mutiple comment video
            videoContainer.appendChild(video.author);
            videoContainer.appendChild(video.comment);
            videoDiv.appendChild(videoContainer);
        }

        //Insert fragment into DOM
        let commentDiv = commentListDiv.parentElement;
        let parentDiv = commentDiv.parentElement;
        parentDiv.insertBefore(videosSection,commentDiv);

        //Update comment count
        let hiddenComments = commentListDiv.querySelectorAll("table.mpbv-hidden").length;
        let newCommentsNum = comments.length - hiddenComments;
        let commentHeader = commentListDiv.children[0];
        commentHeader.children[0].innerText = newCommentsNum + ' Comments';

        //Add note
        let note = document.createElement('span');
        note.className = "mpbv-note";
        note.innerText = '( ' + hiddenComments + ' comments moved to video section )';
        commentHeader.appendChild(note);
        
        
    } 
} 

// Listen for comments to finish loading
const observer = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            getVids();
        }
    }
});

observer.observe(document.getElementById(commentListId), {
    childList: true,
    subtree: true,
});
