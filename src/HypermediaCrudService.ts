import * as crudPage from 'hr.widgets.CrudPage';
import * as pageWidget from 'hr.widgets.PageNumberWidget';
import * as di from 'hr.di';
export { CrudSearch, CrudPageNumbers, CrudTableController, CrudItemEditorController } from 'hr.widgets.CrudPage';
import * as ep from 'hr.externalpromise';

export abstract class HypermediaPageInjector {
    abstract list(query: any): Promise<HypermediaCrudCollection>;
    abstract canList(): Promise<boolean>;
    abstract getDeletePrompt(item: any): string;
}

export interface HypermediaCrudDataResult {
    data: any;
}

export interface HypermediaUpdatableResult extends HypermediaCrudDataResult {
    update(data: any): Promise<any>;
    canUpdate(): boolean;
}

export interface HypermediaDeleteableResult extends HypermediaCrudDataResult {
    delete(): Promise<void>;
    canDelete(): boolean;
}

export function IsHypermediaUpdatableResult(i: HypermediaCrudDataResult): i is HypermediaUpdatableResult {
    return (<HypermediaUpdatableResult>i).update !== undefined
        && (<HypermediaUpdatableResult>i).canUpdate !== undefined;
}

export function IsHypermediaDeleteableResult(i: HypermediaCrudDataResult): i is HypermediaDeleteableResult {
    return (<HypermediaDeleteableResult>i).delete !== undefined
        && (<HypermediaDeleteableResult>i).canDelete !== undefined;
}

export interface HypermediaCrudCollection {
    data: pageWidget.OffsetLimitTotal;
    items: any;

    refresh();
    canRefresh();

    hasListDocs(): boolean;
    getListDocs(): Promise<any>;

    previous();
    canPrevious();

    next();
    canNext();

    first();
    canFirst();

    last();
    canLast();
}

export interface AddableCrudCollection extends HypermediaCrudCollection {
    hasAddDocs(): boolean;
    getAddDocs(): Promise<any>;

    add(data: any): Promise<any>;
    canAdd(): boolean;
}

export function IsAddableCrudCollection(i: HypermediaCrudCollection): i is AddableCrudCollection {
    return (<AddableCrudCollection>i).hasAddDocs !== undefined
        && (<AddableCrudCollection>i).getAddDocs !== undefined
        && (<AddableCrudCollection>i).add !== undefined
        && (<AddableCrudCollection>i).canAdd !== undefined;
}

export class HypermediaCrudService extends crudPage.ICrudService {
    public static get InjectorArgs(): di.DiFunction<any>[] {
        return [HypermediaPageInjector];
    }

    private initialLoad: boolean = true;
    private initialPageLoadPromise = new ep.ExternalPromise();
    private currentPage: HypermediaCrudCollection;

    constructor(private pageInjector: HypermediaPageInjector) {
        super();
    }

    public async getItemSchema() {
        //This ensures that we don't return an item schema until at least one page is loaded.
        await this.initialPageLoadPromise.Promise;

        //Now check current page and see if we can add stuff.
        if (IsAddableCrudCollection(this.currentPage)) {
            if (this.currentPage.hasAddDocs()) {
                var docs = await this.currentPage.getAddDocs();
                return docs.requestSchema;
            }
        }
    }

    public async getSearchSchema() {
        //This ensures that we don't return an item schema until at least one page is loaded.
        await this.initialPageLoadPromise.Promise;
        if (this.currentPage.hasListDocs()) {
            var docs = await this.currentPage.getListDocs();
            return docs.querySchema;
        }
    }

    public async add(item?: any) {
        if (item === undefined) {
            item = {};
        }
        this.fireShowItemEditorEvent(new crudPage.ShowItemEditorEventArgs(item, a => this.finishAdd(a)));
    }

    private async finishAdd(data) {
        if (IsAddableCrudCollection(this.currentPage)) {
            await this.currentPage.add(data);
            this.refreshPage();
        }
    }

    public async canAdd() {
        return IsAddableCrudCollection(this.currentPage) && this.currentPage.canAdd();
    }

    public async edit(item: HypermediaCrudDataResult) {
        var data = this.getEditObject(item);
        this.editData(item, data);
    }

    public canEdit(item: HypermediaCrudDataResult): boolean {
        return IsHypermediaUpdatableResult(item) && item.canUpdate();
    }

    public editData(item: HypermediaCrudDataResult, dataPromise: Promise<any>) {
        this.fireShowItemEditorEvent(new crudPage.ShowItemEditorEventArgs(dataPromise, a => this.finishEdit(a, item)));
    }

    protected async getEditObject(item: HypermediaCrudDataResult) {
        return item.data;
    }

    private async finishEdit(data, item: HypermediaCrudDataResult) {
        if (IsHypermediaUpdatableResult(item)) {
            await item.update(data);
            this.refreshPage();
        }
    }

    public async del(item: HypermediaCrudDataResult) {
        if (IsHypermediaDeleteableResult(item)) {
            await item.delete();
            this.refreshPage();
        }
    }

    public canDel(item: HypermediaCrudDataResult): boolean {
        return IsHypermediaDeleteableResult(item) && item.canDelete();
    }

    public getDeletePrompt(item: HypermediaCrudDataResult): string {
        return this.pageInjector.getDeletePrompt(item);
    }

    public getPage(query: any) {
        var loadingPromise = this.getPageAsync(query);
        if (this.initialLoad) {
            this.initialLoad = false;
            loadingPromise = loadingPromise
                .then(r => {
                    this.initialPageLoadPromise.resolve(r);
                    return r;
                });
        }

        this.fireDataLoadingEvent(new crudPage.DataLoadingEventArgs(loadingPromise));
        return loadingPromise;
    }

    private async getPageAsync(query: any) {
        if (await this.pageInjector.canList()) {
            this.currentPage = await this.pageInjector.list(query);
            return this.currentPage;
        }
        else {
            throw new Error("No permissions to list, cannot get page.");
        }
    }

    public firstPage() {
        this.fireDataLoadingEvent(new crudPage.DataLoadingEventArgs(this.firstPageAsync()));
    }

    private async firstPageAsync() {
        if (this.currentPage) {
            if (this.currentPage.canFirst()) {
                this.currentPage = await this.currentPage.first();
                return this.currentPage;
            }
            else {
                throw new Error("Cannot visit the first page, no link found.");
            }
        }
        else {
            throw new Error("Cannot visit the first page until a page has been loaded.");
        }
    }

    public lastPage() {
        this.fireDataLoadingEvent(new crudPage.DataLoadingEventArgs(this.lastPageAsync()));
    }

    private async lastPageAsync() {
        if (this.currentPage) {
            if (this.currentPage.canLast()) {
                this.currentPage = await this.currentPage.last();
                return this.currentPage;
            }
            else {
                throw new Error("Cannot visit the last page, no link found.");
            }
        }
        else {
            throw new Error("Cannot visit the last page until a page has been loaded.");
        }
    }

    public nextPage() {
        this.fireDataLoadingEvent(new crudPage.DataLoadingEventArgs(this.nextPageAsync()));
    }

    private async nextPageAsync() {
        if (this.currentPage) {
            if (this.currentPage.canNext()) {
                this.currentPage = await this.currentPage.next();
                return this.currentPage;
            }
            else {
                throw new Error("Cannot visit the next page, no link found.");
            }
        }
        else {
            throw new Error("Cannot visit the next page until a page has been loaded.");
        }
    }

    public previousPage() {
        this.fireDataLoadingEvent(new crudPage.DataLoadingEventArgs(this.previousPageAsync()));
    }

    private async previousPageAsync() {
        if (this.currentPage) {
            if (this.currentPage.canPrevious()) {
                this.currentPage = await this.currentPage.previous();
                return this.currentPage;
            }
            else {
                throw new Error("Cannot visit the previous page, no link found.");
            }
        }
        else {
            throw new Error("Cannot visit the previous page until a page has been loaded.");
        }
    }

    public refreshPage() {
        this.fireDataLoadingEvent(new crudPage.DataLoadingEventArgs(this.refreshPageAsync()));
    }

    private async refreshPageAsync() {
        if (this.currentPage) {
            if (this.currentPage.canRefresh()) {
                this.currentPage = await this.currentPage.refresh();
                return this.currentPage;
            }
            else {
                throw new Error("Cannot refresh the page, no link found.");
            }
        }
        else {
            throw new Error("Cannot refresh the page until a page has been loaded.");
        }
    }

    public getItems(list: HypermediaCrudCollection) {
        return list.items;
    }

    public getListingDisplayObject(item: HypermediaCrudDataResult) {
        return item.data;
    }

    public getPageNumberState(list: HypermediaCrudCollection) {
        return new pageWidget.HypermediaPageState(list);
    }
}

export function addServices(services: di.ServiceCollection) {
    services.tryAddShared(crudPage.ICrudService, HypermediaCrudService);
    crudPage.AddServices(services);
}