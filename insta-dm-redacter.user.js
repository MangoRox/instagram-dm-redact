// ==UserScript==
// @name         IG Mass Unsender
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Finds your messages and unsends them one by one
// @author       You
// @match        https://www.instagram.com/direct/t/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const btn = document.createElement("button");
    btn.innerHTML = "test";
    btn.style =
        "position: fixed; top: 20px; right: 20px; z-index: 9999; padding: 12px; background: #8e44ad; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;";
    document.body.appendChild(btn);

    const myUsername = "";

    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

    async function unsendAll() {
        // get username
        if (!myUsername) {
            const gotUsername = getUsername();
            if (!gotUsername) return;
        }

        // 1. Find all message containers that we can currently see
        const allDivs = document.querySelectorAll("div");

        // 2. Filter for divs that match your specific blue color
        const myMessages = Array.from(allDivs).filter((el) => {
            const style = window.getComputedStyle(el);
            return style.backgroundColor === "rgb(74, 93, 249)";
        });

        // 3. Delete each message found
        console.log(`Found ${myMessages.length} blue messages.`);
        while (myMessages.length > 0) {
            for (const msg of myMessages) {
                // Hover over the message to reveal the "More" button 
                msg.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
                await sleep(100);

                // Click More button 
                const container = msg.closest("div[role='none']").parentElement;
                console.log(container.outerHTML);
                const moreButton = container.querySelector('div[role="button"][aria-haspopup="menu"][aria-isexpanded="false"]');


                let unsendOption = null;
                const unsendSpan = Array.from(document.querySelectorAll('span'))
                    .find(el => el.innerText && el.innerText.trim().toLowerCase() === 'unsend');
                if (unsendSpan) {
                    let ancestor = unsendSpan;
                    // Walk up ancestors until we find a div with role="button" or run out of parents
                    while (ancestor && !(ancestor.tagName === 'DIV' && ancestor.getAttribute && ancestor.getAttribute('role') === 'button')) {
                        ancestor = ancestor.parentElement;
                        
                    }
                    unsendOption = (ancestor && ancestor.tagName === 'DIV' && ancestor.getAttribute('role') === 'button') ? ancestor : null;
                }
                if (unsendOption) {
                    unsendOption.click();
                    await sleep(800);

                    // Confirm the final popup
                    const confirm = Array.from(document.querySelectorAll('div'))
                        .find(el => el.innerText === 'Unsend');
                    if (confirm) confirm.click();
                }

                // If 
                myMessages = Array.from(allDivs).filter((el) => {
                    const style = window.getComputedStyle(el);
                    return style.backgroundColor === "rgb(74, 93, 249)";
                });
            }
        }
    }

    function getUsername() {
        const input = prompt("Please enter your Instagram username:");

        if (input && input.trim().length > 0) {
            myUsername = input.trim().replace('@', ''); // Remove @ if they included it
            console.log(`Targeting messages from: ${myUsername}`);
            return true;
        } else {
            alert("Username is required to start the script safely.");
            return false;
        }
    }

    btn.addEventListener("click", unsendAll);
})();
