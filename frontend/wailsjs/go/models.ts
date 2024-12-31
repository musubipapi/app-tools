export namespace models {
	
	export class File {
	    Data: number[];
	    Filename: string;
	    ID: string;
	
	    static createFrom(source: any = {}) {
	        return new File(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Data = source["Data"];
	        this.Filename = source["Filename"];
	        this.ID = source["ID"];
	    }
	}

}

