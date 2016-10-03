﻿"use strict"

/**
 * A simple propmt that uses the browser confirm function, this wraps that function in a promise
 * so it matches the other prompt interfaces.
 */
export function BrowserPrompt() {
    function prompt(message) {
        return new Promise(function (resovle, reject) {
            if (confirm(message)) {
                resovle(true);
            }
            else {
                resovle(false);
            }
        });
    }
    this.prompt = prompt;
}