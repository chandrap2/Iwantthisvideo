document.addEventListener("DOMContentLoaded", () => {
    let accs, ACC_LIMIT;
    let j = 0; // count how many accounts have been processed
    const pic_url_mod = 7 // "_normal".length;

    let pages = [], currPage = 0;

    let user, user_pic;

    let signinBtn = document.getElementById("login-btn");
    signinBtn.addEventListener("click", () => {
        let req = new XMLHttpRequest();
        req.open("GET", "http://localhost:3001/oauth1");
        req.onload = () => {
            let req_token = JSON.parse(req.responseText);
            // console.log(req_token);

            let url = new URL("https://api.twitter.com/oauth/authenticate");
            url.searchParams.set("oauth_token", req_token.oauth_token);

            let params = "menubar=no,toolbar=no,width=600,height=600";
            auth_window = window.open(url, "test", params);
            closeRedir();
            // console.log("ready to authenticate");
        }

        req.send();
    });

    let signoutBtn = document.getElementById("logout-btn");
    signoutBtn.addEventListener("click", () => {
        let req = new XMLHttpRequest();
        req.open("GET", "http://localhost:3001/logout");

        req.onload = () => {
            results_area.innerHTML = "";
            input.style.display = "none";
            document.getElementById("signed-in").style.display = "none";
            signoutBtn.style.display = "none";
            signinBtn.style.display = "";

            accs = null;
            ACC_LIMIT = j = 0;
        }

        req.send();
    });

    let input = document.getElementById("input");
    let loading = document.getElementById("loading");
    let retrieveBtn = document.getElementById("retrieve");
    let results_area = document.getElementById("results");

    document.getElementById("left").addEventListener("click", () => {
        currPage = (currPage == 0) ? pages.length - 1 : currPage - 1;
        let df = document.createDocumentFragment();
        df.appendChild(pages[currPage]);
        results_area.innerHTML = "";
        results_area.appendChild(df);
    });

    document.getElementById("right").addEventListener("click", () => {
        currPage = (currPage == pages.length - 1) ? 0 : currPage + 1;
        let df = document.createDocumentFragment();
        df.appendChild(pages[currPage]);
        results_area.innerHTML = "";
        results_area.appendChild(df);
    });

    let auth_window;
    
    fetch("/verify", {credentials: "include"}) // verify user
    .then(res => {
        
        if (verified) { // verified
        } else { // not verified
            fetch("/get_req_token")  // get request token
            .then(res => {
                /**
                 * build twitter authentication url with 'res'
                 */
        
                window.open(url, "authenticate", windowParams);
            })
            .catch(err => {
                
            });
        }
    })
    .catch(err => {

    });

    // function removeListener(element, listener) {

    // }

    function toggleElement(element) {
        
    }
});