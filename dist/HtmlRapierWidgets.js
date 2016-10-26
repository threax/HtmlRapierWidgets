jsns.amd("hr.widgets.confirm",function(t){t(["require","exports"],function(t,e){"use strict";var r=function(){function t(){}return t.prototype.confirm=function(t){return new Promise(function(e,r){e(window.confirm(t)?!0:!1)})},t}();e.BrowserConfirm=r})}),jsns.amd("hr.widgets.crudpage",function(t){t(["require","exports","hr.controller","hr.widgets.jsonobjecteditor","hr.widgets.editableitemslist","hr.widgets.editableitem","hr.widgets.confirm"],function(t,e,r,n,o,i,a){"use strict";function s(t){function e(){return g.showLoad(),Promise.resolve(t.list()).then(function(t){g.setData(t),g.showMain()}).catch(function(t){throw g.showError(),t})}function s(r){return d.confirm("Delete "+r[t.itemNameProperty]+" ?").then(function(n){if(n)return g.showLoad(),t.del(r).then(function(t){return e()})})}function u(t,e){return h.showLoad(),h.show(),h.clearError(),Promise.resolve(t).then(function(t){return h.showMain(),c(t,e)})}function c(t,r){return h.edit(t).then(function(t){if(void 0!==t){if(h.showLoad(),void 0===r)throw new Error("Cannot save updates to item, no persistFunc given.");return Promise.resolve(r(t)).then(function(t){h.close(),e()}).catch(function(t){h.showError(t);var e=h.getData();throw c(e,r),t})}})}var l=t.listingActions;void 0===l&&(l={}),void 0===t.itemNameProperty&&(t.itemNameProperty="name");var f=t.pageActions;void 0===f&&(f={}),l.edit=function(e){return u(e,t.update)},l.del=s;var d=t.deletePrompt;void 0===d&&(d=new a.BrowserConfirm);var g={itemControllerConstructor:i.EditableItem,itemControllerContext:l,getData:t.list,add:function(){return u(null,t.create)},pageActions:f};r.create(t.listController,o.EditableItemsListController,g);var h={schema:t.schema};r.create(t.itemEditorController,n.JsonObjectEditor,h),this.refreshData=e,this.edit=u}e.CrudPage=s})}),jsns.amd("hr.widgets.editableitem",function(t){t(["require","exports","hr.typeidentifiers"],function(t,e,r){"use strict";function n(t,e,n){var o=this;for(var i in e)r.isFunction(e[i])&&(o[i]=function(t){return function(r){r.preventDefault(),e[t](n)}}(i))}e.EditableItem=n})}),jsns.amd("hr.widgets.editableitemslist",function(t){t(["require","exports","hr.controller","hr.toggles"],function(t,e,r,n){"use strict";function o(t,e){function o(t){var n=void 0;void 0!==e.itemControllerConstructor&&(n=r.createOnCallback(e.itemControllerConstructor,e.itemControllerContext)),a.setData(t,n)}function i(t){return t.preventDefault(),e.add()}var a=t.getModel("listing"),s=t.getToggle("load"),u=t.getToggle("main"),c=t.getToggle("error"),l=new n.Group(s,u,c);l.activate(u),this.setData=o,e.setData=o,void 0!==e.add&&(this.add=i);for(var f in e.pageActions)this[f]=e.pageActions[f];e.showLoad=function(){l.activate(s)},e.showMain=function(){l.activate(u)},e.showError=function(){l.activate(c)}}e.EditableItemsListController=o})}),jsns.amd("hr.widgets.json-editor-plugin",function(t){t(["require","exports","jdorn.json-editor"],function(t,e,r){"use strict";function n(t){function e(){t.root.setValue(null,!0)}this.setData=function(e){t.root.setValue(e,!0)},this.appendData=this.setData,this.clear=e,this.getData=function(){return t.getValue()},this.getSrc=function(){return null},this.getEditor=function(){return t}}function o(t,e){return new n(new r.JSONEditor(t,e))}r.JSONEditor.defaults.theme="bootstrap3custom",r.JSONEditor.defaults.iconlib="bootstrap3",r.JSONEditor.defaults.disable_collapse=!0,r.JSONEditor.defaults.disable_edit_json=!0,r.JSONEditor.defaults.disable_properties=!0,r.JSONEditor.defaults.resolvers.unshift(function(t){if("boolean"===t.type)return"select"===t.format||t.options&&t.options.select?"select":"checkbox"}),e.Model=n,e.create=o})}),jsns.amd("hr.widgets.jsonobjecteditor",function(t){t(["require","exports","hr.toggles","hr.widgets.json-editor-plugin","hr.promiseutils"],function(t,e,r,n,o){"use strict";function i(t,e){function i(t){return y=new o.ExternalPromise,p.setData(t),h.setData("Edit"),m.setData(t),y.promise}function s(){return m.getData()}function c(t){if(t.preventDefault(),null!==y){var e=s(),r=y;y=null,r.resolve(e)}}function l(){if(null!==y){var t=y;y=null,t.resolve()}}function f(t,e,r){if(null!==g){if("root"===r)return{path:r,message:g.message};if(void 0!==g.errors){var n=d(r),o=g.errors[n];if(void 0!==o)return P.watch(r,n,g),{path:r,message:o}}}return u}function d(t){return t.replace("root.","")}var g=null,h=t.getModel("mode"),p=t.getModel("title"),v=t.getModel("error"),m=new n.create(t.getHandle("editorHolder"),{schema:e.schema,disable_edit_json:!0,disable_properties:!0,disable_collapse:!0,show_errors:"always",custom_validators:[f]}),w=m.getEditor(),P=new a(w),b=t.getToggle("dialog");b.offEvent.add(this,l);var E=t.getToggle("load"),T=t.getToggle("main"),D=t.getToggle("error"),j=new r.Group(E,T,D);j.activate(T);var y=null;this.edit=i,e.edit=i,e.getData=s,this.submit=c,e.showMain=function(){j.activate(T)},e.showLoad=function(){j.activate(E)},e.showError=function(t){var e="No error message";void 0!==t.message&&(e=t.message),v.setData(e),j.activate(D),g=t,w.onChange(),T.on()},e.clearError=function(){P.clear(),g=null,w.onChange(),j.activate(T),v.clear()},e.show=function(){b.on()},e.close=function(){b.off()}}function a(t){function e(e,r,o){void 0!==n[e]&&n[e].clear(),n[e]=new s(t,e,r,o)}function r(){for(var t in n)n[t].clear(),delete n[t]}var n={};this.watch=e,this.clear=r}function s(t,e,r,n){function o(){n.errors.hasOwnProperty(r)&&delete n.errors[r],window.setTimeout(i,1)}function i(){t.unwatch(e,o)}this.clear=i,t.watch(e,o)}var u={path:null};e.JsonObjectEditor=i})}),jsns.amd("hr.widgets.loadlifecycle",function(t){t(["require","exports","hr.toggles"],function(t,e,r){"use strict";var n=function(){function t(){this.loadToggle="load",this.mainToggle="main",this.errorToggle="error"}return Object.defineProperty(t.prototype,"LoadToggle",{get:function(){return this.loadToggle},set:function(t){this.loadToggle=t},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"MainToggle",{get:function(){return this.mainToggle},set:function(t){this.mainToggle=t},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"ErrorToggle",{get:function(){return this.errorToggle},set:function(t){this.errorToggle=t},enumerable:!0,configurable:!0}),t}();e.LifecycleSettings=n;var o=function(){function t(t,e){void 0===e&&(e=new n),this.load=t.getToggle(e.LoadToggle),this.main=t.getToggle(e.MainToggle),this.error=t.getToggle(e.ErrorToggle),this.group=new r.Group(this.load,this.main,this.error)}return t.prototype.showLoading=function(){this.group.activate(this.load)},t.prototype.showMain=function(){this.group.activate(this.main)},t.prototype.showError=function(){this.group.activate(this.error)},t}();e.Lifecycle=o})}),jsns.amd("hr.widgets.navmenu",function(t){t(["require","exports","hr.controller","hr.eventhandler"],function(t,e,r,n){"use strict";function o(){function t(t,e){void 0!==e&&(e=r.createOnCallback(e));var n={name:t,created:e};o.push(n),i.fire(n)}function e(){return o}var o=[],i=new n.EventHandler;this.itemAdded=i.modifier,this.add=t,this.getItems=e}function i(t){var e=a[t];return void 0===e&&(a[t]=e=new o),e}var a={};e.getNavMenu=i})}),jsns.amd("hr.widgets.pageddata",function(t){t(["require","exports","hr.http","hr.eventhandler"],function(t,e,r,n){"use strict";function o(t,e){function o(){i.fire();var e=t+"?page="+this.currentPage+"&count="+this.resultsPerPage;r.get(e).then(function(t){a.fire(t)}).catch(function(t){s.fire(t)})}var i=new n.EventHandler;this.updating=i.modifier;var a=new n.EventHandler;this.updated=a.modifier;var s=new n.EventHandler;this.error=s.modifier,this.resultsPerPage=e,this.currentPage=0,this.updateData=o}e.PagedData=o})}),jsns.amd("hr.widgets.pagenumbers",function(t){t(["require","exports","hr.toggles","hr.eventhandler"],function(t,e,r,n){"use strict";function o(t,e){function o(t){p.fire(t)}function i(t){return function(){o(v+t)}}function a(){var t=m.currentPage+1;t<f&&o(t)}function s(){var t=m.currentPage-1;t>=0&&o(t)}function u(){for(var t={previousPage:function(t){t.preventDefault(),s()},nextPage:function(t){t.preventDefault(),a()}},n=["on","off","active"],o=0,u="page"+o,c=e.getToggle(u,n);!r.isNullToggle(c);)l.push(c),d.add(c),t[u]=i(o),u="page"+ ++o,c=e.getToggle(u,n);e.setListener(t)}function c(){f=Math.floor(this.totalResults/this.resultsPerPage),this.totalResults%this.resultsPerPage!==0&&++f;var e,r=0;e=this.currentPage+h>f?f-g:this.currentPage-h,e<0&&(e=0),v=e,t.setData(function(t){return e===m.currentPage&&d.activate(l[r],"active","on"),e>=f&&l[r].off(),++r,e++ +1})}var l=[],f=0,d=new r.Group;u();var g=l.length,h=Math.floor(g/2),p=new n.EventHandler;this.pageChangeRequested=p.modifier;var v=0,m=this;this.currentPage=0,this.totalResults=0,this.resultsPerPage=0,this.updatePages=c}e.PageNumbers=o})}),jsns.amd("hr.widgets.prompt",function(t){t(["require","exports"],function(t,e){"use strict";var r=function(){function t(t,e){this.accepted=t,this.data=e}return t.prototype.isAccepted=function(){return this.accepted},t.prototype.getData=function(){return this.data},t}();e.PromptResult=r;var n=function(){function t(){}return t.prototype.prompt=function(t,e){return new Promise(function(n,o){var i=window.prompt(t,e),a=new r(null!==i,i);n(a)})},t}();e.BrowserPrompt=n})});
//# sourceMappingURL=HtmlRapierWidgets.js.map