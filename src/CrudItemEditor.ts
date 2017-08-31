import * as controller from 'hr.controller';
import * as form from 'hr.form';
import { ICrudService, ItemEditorClosedCallback, ItemUpdatedCallback, ShowItemEditorEventArgs } from 'hr.widgets.CrudService';
import { MainLoadErrorLifecycle } from 'hr.widgets.MainLoadErrorLifecycle';
import * as error from 'hr.error';

export enum CrudItemEditorType{
    Add = 1,
    Update = 1 << 1
}

export class CrudItemEditorControllerOptions {
    public static get InjectorArgs(): controller.InjectableArgs {
        return [];
    }

    public formName = "input";
    public dialogName = "dialog";
    public mainErrorToggleName = "mainError";
    public mainErrorViewName = "mainError";
    public mainToggleName = "main";
    public loadToggleName = "load";
    public errorToggleName = "error";
    public activateLoadingOnStart = true;
    public type = CrudItemEditorType.Add | CrudItemEditorType.Update;
}

export class CrudItemEditorControllerExtensions {
    constructed(editor: CrudItemEditorController, bindings: controller.BindingCollection): void {

    }

    setup(editor: CrudItemEditorController): Promise<void> {
        return Promise.resolve(undefined);
    }
}

export class CrudItemEditorController{
    public static get InjectorArgs(): controller.InjectableArgs {
        return [controller.BindingCollection,
            CrudItemEditorControllerExtensions,
            ICrudService,
            /*Options here, must call constructor manually unless defaults are ok. Leave options last.*/];
    }

    private _form: controller.IForm<any>;
    private _dialog: controller.OnOffToggle;
    private lifecycle: MainLoadErrorLifecycle;
    private updated: ItemUpdatedCallback;
    private closed: ItemEditorClosedCallback;
    private _autoClose: boolean = true;
    private mainErrorToggle: controller.OnOffToggle;
    private mainErrorView: controller.IView<Error>;

    constructor(bindings: controller.BindingCollection,
        private extensions: CrudItemEditorControllerExtensions,
        crudService: ICrudService,
        options: CrudItemEditorControllerOptions)
    {
        if(options === undefined){
            options = new CrudItemEditorControllerOptions();
        }

        this._form = new form.NeedsSchemaForm<any>(bindings.getForm<any>(options.formName));
        this._dialog = bindings.getToggle(options.dialogName);
        this._dialog.offEvent.add(i => !this.closed || this.closed());
        this.mainErrorToggle = bindings.getToggle(options.mainErrorToggleName);
        this.mainErrorView = bindings.getView<Error>(options.mainErrorViewName);
        this.lifecycle = new MainLoadErrorLifecycle(
            bindings.getToggle(options.mainToggleName),
            bindings.getToggle(options.loadToggleName),
            bindings.getToggle(options.errorToggleName),
            options.activateLoadingOnStart);

        if((options.type & CrudItemEditorType.Add) === CrudItemEditorType.Add){
            crudService.showAddItemEvent.add(arg => {
                this.showItemEditorHandler(arg);
            });
        }
        if((options.type & CrudItemEditorType.Update) === CrudItemEditorType.Update){
            crudService.showItemEditorEvent.add(arg => {
                this.showItemEditorHandler(arg);
            });
        }
        crudService.closeItemEditorEvent.add(() => {
            this._dialog.off();
        });
        this.extensions.constructed(this, bindings);
        this.setup(crudService, options);
    }

    public async submit(evt: Event): Promise<void> {
        evt.preventDefault();
        try {
            this.mainErrorToggle.off();
            this.lifecycle.showLoad();
            var data = this._form.getData() || {}; //Form returns null, but to get errors from the server, need to at least send an empty object
            await this.updated(data);
            this.lifecycle.showMain();
            if(this._autoClose){
                this._dialog.off();
            }
        }
        catch (err) {
            if (error.isFormErrors(err)) {
                this._form.setError(err);
                this.lifecycle.showMain();
                this.mainErrorView.setData(err);
                this.mainErrorToggle.on();
            }
            else {
                this.lifecycle.showError(err);
            }
        }
    }

    public get autoClose(): boolean{
        return this._autoClose;
    }

    public set autoClose(value: boolean){
        this._autoClose = value;
    }

    public get form(): controller.IForm<any> {
        return this._form;
    }

    public get dialog(): controller.OnOffToggle {
        return this._dialog;
    }

    private async showItemEditorHandler(arg: ShowItemEditorEventArgs) {
        this.mainErrorToggle.off();
        try {
            this._dialog.on();
            this.lifecycle.showLoad();
            var data = await arg.dataPromise;
            this.updated = arg.update;
            this.closed = arg.closed;
            this._form.setData(data);
            this.lifecycle.showMain();
        }
        catch (err) {
            this.lifecycle.showError(err);
        }
    }

    private async setup(crudService: ICrudService, options: CrudItemEditorControllerOptions) {
        try {
            await this.extensions.setup(this);
            var schema;
            if((options.type & CrudItemEditorType.Update) === CrudItemEditorType.Update) {
                //This covers the case where the editor is an update only or update and add
                schema = await crudService.getItemSchema();
            }
            else if((options.type & CrudItemEditorType.Add) === CrudItemEditorType.Add) {
                //This convers when the editor is for adding items
                schema = await crudService.getAddItemSchema();
            }
            this._form.setSchema(schema);
        }
        catch (err) {
            console.log("An error occured loading the schema for the CrudItemEditor. Message: " + err.message);
        }
    }
}