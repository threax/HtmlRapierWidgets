jsns.amd("hr.widgets.crudpage",function(t){t(["require","exports","hr.controller","hr.widgets.jsonobjecteditor","hr.widgets.editableitemslist","hr.widgets.editableitem","hr.widgets.prompt"],function(t,e,r,n,o,i,a){"use strict";function s(t){function e(){return h.showLoad(),Promise.resolve(t.list()).then(function(t){h.setData(t),h.showMain()}).catch(function(t){throw h.showError(),t})}function s(r){return f.prompt("Delete "+r.name+" ?").then(function(n){if(n)return h.showLoad(),t.del(r).then(function(t){return e()})})}function u(t,e){return g.showLoad(),g.show(),g.clearError(),Promise.resolve(t).then(function(t){return g.showMain(),c(t,e)})}function c(t,r){return g.edit(t).then(function(t){if(void 0!==t){if(g.showLoad(),void 0===r)throw new Error("Cannot save updates to item, no persistFunc given.");return Promise.resolve(r(t)).then(function(t){g.close(),e()}).catch(function(t){g.showError(t);var e=g.getData();throw c(e,r),t})}})}var l=t.listingActions;void 0===l&&(l={});var d=t.pageActions;void 0===d&&(d={}),l.edit=function(e){return u(e,t.update)},l.del=s;var f=t.deletePrompt;void 0===f&&(f=new a.BrowserPrompt);var h={itemControllerConstructor:i.EditableItem,itemControllerContext:l,getData:t.list,add:function(){return u(null,t.create)},pageActions:d};r.create(t.listController,o.EditableItemsListController,h);var g={schema:t.schema};r.create(t.itemEditorController,n.JsonObjectEditor,g),this.refreshData=e,this.edit=u}e.CrudPage=s})}),jsns.amd("hr.widgets.editableitem",function(t){t(["require","exports","hr.typeidentifiers"],function(t,e,r){"use strict";function n(t,e,n){var o=this;for(var i in e)r.isFunction(e[i])&&(o[i]=function(t){return function(r){r.preventDefault(),e[t](n)}}(i))}e.EditableItem=n})}),jsns.amd("hr.widgets.editableitemslist",function(t){t(["require","exports","hr.controller","hr.toggles"],function(t,e,r,n){"use strict";function o(t,e){function o(t){var n=void 0;void 0!==e.itemControllerConstructor&&(n=r.createOnCallback(e.itemControllerConstructor,e.itemControllerContext)),a.setData(t,n)}function i(t){return t.preventDefault(),e.add()}var a=t.getModel("listing"),s=t.getToggle("load"),u=t.getToggle("main"),c=t.getToggle("error"),l=new n.Group(s,u,c);l.activate(u),this.setData=o,e.setData=o,void 0!==e.add&&(this.add=i);for(var d in e.pageActions)this[d]=e.pageActions[d];e.showLoad=function(){l.activate(s)},e.showMain=function(){l.activate(u)},e.showError=function(){l.activate(c)}}e.EditableItemsListController=o})}),jsns.amd("hr.widgets.json-editor-plugin",function(t){t(["require","exports","jdorn.json-editor"],function(t,e,r){"use strict";function n(t){function e(){t.root.setValue(null,!0)}this.setData=function(e){t.root.setValue(e,!0)},this.appendData=this.setData,this.clear=e,this.getData=function(){return t.getValue()},this.getSrc=function(){return null},this.getEditor=function(){return t}}function o(t,e){return new n(new r.JSONEditor(t,e))}r.JSONEditor.defaults.theme="bootstrap3custom",r.JSONEditor.defaults.iconlib="bootstrap3",r.JSONEditor.defaults.disable_collapse=!0,r.JSONEditor.defaults.disable_edit_json=!0,r.JSONEditor.defaults.disable_properties=!0,r.JSONEditor.defaults.resolvers.unshift(function(t){if("boolean"===t.type)return"select"===t.format||t.options&&t.options.select?"select":"checkbox"}),e.Model=n,e.create=o})}),jsns.amd("hr.widgets.jsonobjecteditor",function(t){t(["require","exports","hr.toggles","hr.widgets.json-editor-plugin","hr.promiseutils"],function(t,e,r,n,o){"use strict";function i(t,e){function i(t){return x=new o.ExternalPromise,v.setData(t),g.setData("Edit"),m.setData(t),x.promise}function s(){return m.getData()}function c(t){if(t.preventDefault(),null!==x){var e=s(),r=x;x=null,r.resolve(e)}}function l(){if(null!==x){var t=x;x=null,t.resolve()}}function d(t,e,r){if(null!==h){if("root"===r)return{path:r,message:h.message};if(void 0!==h.errors){var n=f(r),o=h.errors[n];if(void 0!==o)return P.watch(r,n,h),{path:r,message:o}}}return u}function f(t){return t.replace("root.","")}var h=null,g=t.getModel("mode"),v=t.getModel("title"),p=t.getModel("error"),m=new n.create(t.getHandle("editorHolder"),{schema:e.schema,disable_edit_json:!0,disable_properties:!0,disable_collapse:!0,show_errors:"always",custom_validators:[d]}),w=m.getEditor(),P=new a(w),E=t.getToggle("dialog");E.offEvent.add(this,l);var b=t.getToggle("load"),D=t.getToggle("main"),j=t.getToggle("error"),C=new r.Group(b,D,j);C.activate(D);var x=null;this.edit=i,e.edit=i,e.getData=s,this.submit=c,e.showMain=function(){C.activate(D)},e.showLoad=function(){C.activate(b)},e.showError=function(t){var e="No error message";void 0!==t.message&&(e=t.message),p.setData(e),C.activate(j),h=t,w.onChange(),D.on()},e.clearError=function(){P.clear(),h=null,w.onChange(),C.activate(D),p.clear()},e.show=function(){E.on()},e.close=function(){E.off()}}function a(t){function e(e,r,o){void 0!==n[e]&&n[e].clear(),n[e]=new s(t,e,r,o)}function r(){for(var t in n)n[t].clear(),delete n[t]}var n={};this.watch=e,this.clear=r}function s(t,e,r,n){function o(){n.errors.hasOwnProperty(r)&&delete n.errors[r],window.setTimeout(i,1)}function i(){t.unwatch(e,o)}this.clear=i,t.watch(e,o)}var u={path:null};e.JsonObjectEditor=i})}),jsns.amd("hr.widgets.navmenu",function(t){t(["require","exports","hr.controller","hr.eventhandler"],function(t,e,r,n){"use strict";function o(){function t(t,e){void 0!==e&&(e=r.createOnCallback(e));var n={name:t,created:e};o.push(n),i.fire(n)}function e(){return o}var o=[],i=new n.EventHandler;this.itemAdded=i.modifier,this.add=t,this.getItems=e}function i(t){var e=a[t];return void 0===e&&(a[t]=e=new o),e}var a={};e.getNavMenu=i})}),jsns.amd("hr.widgets.pageddata",function(t){t(["require","exports","hr.http","hr.eventhandler"],function(t,e,r,n){"use strict";function o(t,e){function o(){i.fire();var e=t+"?page="+this.currentPage+"&count="+this.resultsPerPage;r.get(e).then(function(t){a.fire(t)}).catch(function(t){s.fire(t)})}var i=new n.EventHandler;this.updating=i.modifier;var a=new n.EventHandler;this.updated=a.modifier;var s=new n.EventHandler;this.error=s.modifier,this.resultsPerPage=e,this.currentPage=0,this.updateData=o}e.PagedData=o})}),jsns.amd("hr.widgets.pagenumbers",function(t){t(["require","exports","hr.toggles","hr.eventhandler"],function(t,e,r,n){"use strict";function o(t,e){function o(t){v.fire(t)}function i(t){return function(){o(p+t)}}function a(){var t=m.currentPage+1;t<d&&o(t)}function s(){var t=m.currentPage-1;t>=0&&o(t)}function u(){for(var t={previousPage:function(t){t.preventDefault(),s()},nextPage:function(t){t.preventDefault(),a()}},n=["on","off","active"],o=0,u="page"+o,c=e.getToggle(u,n);!r.isNullToggle(c);)l.push(c),f.add(c),t[u]=i(o),u="page"+ ++o,c=e.getToggle(u,n);e.setListener(t)}function c(){d=Math.floor(this.totalResults/this.resultsPerPage),this.totalResults%this.resultsPerPage!==0&&++d;var e,r=0;e=this.currentPage+g>d?d-h:this.currentPage-g,e<0&&(e=0),p=e,t.setData(function(t){return e===m.currentPage&&f.activate(l[r],"active","on"),e>=d&&l[r].off(),++r,e++ +1})}var l=[],d=0,f=new r.Group;u();var h=l.length,g=Math.floor(h/2),v=new n.EventHandler;this.pageChangeRequested=v.modifier;var p=0,m=this;this.currentPage=0,this.totalResults=0,this.resultsPerPage=0,this.updatePages=c}e.PageNumbers=o})}),jsns.amd("hr.widgets.prompt",function(t){t(["require","exports"],function(t,e){"use strict";function r(){function t(t){return new Promise(function(e,r){e(confirm(t)?!0:!1)})}this.prompt=t}e.BrowserPrompt=r})});
//# sourceMappingURL=HtmlRapierWidgets.js.map
