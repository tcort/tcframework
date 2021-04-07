'use strict';

const JSONPointer = require('../utils/JSONPointer');

class TCTemplate {

    constructor(template = '') {
        if (typeof template !== 'string') {
            throw new Error('TCTemplate(template): template must be a string.');
        }

        this.template = template;
        this.output = '';
        this.inComment = 0;
        this.inFalseIf = 0;
        this.openTags = [];

        this.inForLoop = 0;
        this.forLoopVars = [];
        this.forLoopContents = '';
    }

    startTag(tag) {

        if (typeof tag !== 'string') {
            throw new Error('TCTemplate.startTag(tag): tag must be a string.');
        }

        if (this.inForLoop !== 0) {
            this.forLoopContents += tag;
            if (tag.startsWith('[for ')) {
                this.inForLoop++;
            }
            return;
        }

        switch (true) {

            case /^\[for [^ ]+ in [^\]]+\]$/i.test(tag):
                this.inForLoop = 1;
                this.forLoopVars = tag.slice(5, -1).split(/ in /);
                break;

            case /^\[comment\]$/i.test(tag):
                this.inComment++;
                break;

            case /^\[if [^\]]+\]$/i.test(tag):
                if (this.inFalseIf || JSONPointer.get(this.locals, tag.slice(4, -1)) !== true) {
                    this.inFalseIf++;
                }
                break;

            default:
                throw new Error('TCTemplate.startTag(tag): unrecognized TCTemplate');

        }

        const actualTag = tag.slice(1).split(/[ =\]]/)[0];
        this.openTags.push(actualTag);

    }

    selfClosingTag(tag) {

        if (typeof tag !== 'string') {
            throw new Error('TCTemplate.selfClosingTag(tag): tag must be a string.');
        }

        if (this.inForLoop !== 0) {
            this.forLoopContents += tag;
            return;
        }

        if (this.inComment !== 0 || this.inFalseIf !== 0) {
            return;
        }

        switch (true) {

            case /^\[=[^\]]+\]$/i.test(tag):
                this.output += TCTemplate.encodeHtmlEntities( (JSONPointer.get(this.locals, tag.slice(2, -1)) || '') );
                break;

            case /^\[-[^\]]+\]$/i.test(tag):
                this.output += (JSONPointer.get(this.locals, tag.slice(2, -1)) || '');
                break;

            default:
                throw new Error('TCTemplate.selfClosingTag(tag): unrecognized TCTemplate');
        }

    }

    text(txt) {
        if (typeof txt !== 'string') {
            throw new Error('TCTemplate.text(txt): txt must be a string.');
        }

        if (this.inForLoop !== 0) {
            this.forLoopContents += txt;
            return;
        }

        if (this.inComment === 0 && this.inFalseIf === 0) {
            this.output += txt;
        }
    }

    endTag(tag) {

        if (typeof tag !== 'string') {
            throw new Error('TCTemplate.endTag(tag): tag must be a string.');
        }

        if (tag === '[/for]') {
            this.inForLoop--;
        }
        if (this.inForLoop !== 0) {
            this.forLoopContents += tag;
            return;
        }

        switch (tag) {

            case '[/for]':
                const inner = new TCTemplate(this.forLoopContents);
                JSONPointer.get(this.locals, this.forLoopVars[1]).forEach((item) => {
                    JSONPointer.set(this.locals, this.forLoopVars[0], item);
                    this.output += inner.render(this.locals);
                });
                this.forLoopContents = '';
                this.forLoopVars = [];
                break;

            case '[/comment]':
                this.inComment--;
                break;

            case '[/if]':
                if (this.inFalseIf !== 0) {
                    this.inFalseIf--;
                }
                break;

            default:
                throw new Error('TCTemplate.endTag(tag): unrecognized TCTemplate');
        }

        const expectedTag = this.openTags.pop();
        const actualTag = tag.slice(2).split(/[ =\]]/)[0];
        if (expectedTag !== actualTag) {
            throw new Error('TCTemplate.endTag(tag): unbalanced tags');
        }
    }

    done() {
        if (this.openTags.length !== 0) {
            throw new Error('TCTemplate.done(): missing closing tag(s)');
        }
        const output = this.output;
        this.output = '';
        return output;
    }

    render(locals = {}) {

        if (typeof locals !== 'object') {
            throw new Error('TCTemplate.parse(locals): locals must be an object.');
        }

        this.locals = locals;
        this.output = '';
        this.openTags = [];

        let token = '';
        let in_tag = false;
        let input = this.template.split('');

        while (input.length > 0) {

            const ch = input.shift();

            if (in_tag && ch === ']') {
                token += ch;
                in_tag = false;
                if (token[1] === '/') {
                    this.endTag(token);
                } else if (token[1] === '=' || token[1] === '-') {
                    this.selfClosingTag(token);
                } else {
                    this.startTag(token);
                }
                token = '';
            } else if (!in_tag && ch === '[') {
                input.unshift(ch);
                in_tag = true;
                if (token.length > 0) {
                    this.text(token);
                }
                token = '';
            } else {
                token += ch;
            }

        }

        this.output += token; // append any trailing text

        return this.done();

    }

    static encodeHtmlEntities(input) {
        if (typeof input !== 'string') {
            throw new Error('TCTemplate.encodeEntities(input): input must be a string.');
        }
        return input.replace(/[\u00A0-\u9999<>\&"']/gim, (ch) => `&#${ch.charCodeAt(0)};`);
    }

}

module.exports = TCTemplate;
