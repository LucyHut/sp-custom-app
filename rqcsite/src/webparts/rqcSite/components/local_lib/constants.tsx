/*jshint esversion: 6 */ 
/********************************************
 * Global Scope Variables definition
 * 
 * Author: Lucie Hutchins, DevOps Engineer
 * Department: IT
 * Company: The Jackson Laboratory
 * Date: 2020
 * 
   *  SharePoint tenants
   * 
   * Models are relative to the Documents library on a given tenant site
   * Production is done on the Financial Services Site of jacksonlaboratory.sharepoint.com tenant
   * Test is done on the jaxspdev site of jaxspdev.sharepoint.com
   * 
  **********************************************************/
export const TENANT={
  "jaxspdev.sharepoint.com":{
    "site_id":"jaxspdev.sharepoint.com,36aaf926-1d97-425e-85a0-401fa71646b5,955a71d8-45c7-4ae8-b752-f3b56e08d99d",
    "site_models_dir":"/drives/b!JvmqNpcdXkKFoEAfpxZGtdhxWpXHRehKt1LztW4I2Z2wb_4GJa7aSphM9l94zrKL/root:/models:"
  },
  "jacksonlaboratory.sharepoint.com":{
    "site_id":"jacksonlaboratory.sharepoint.com,1c0c489c-2b03-4bd6-a354-008a84ee0611,57ac02ba-b40c-4648-8f01-5fc80f25dad0",
    "site_models_dir":"/drives/b!nEgMHAMr1kujVACKhO4GEboCrFcMtEhGjwFfyA8l2tAcIBGnSck7S6kzFNjqSmFe/root:/models:"
  }
};
//APIs endpoints
export const END_POINTS={
 "active_au":"active_au.json",
 "active_emp":"active_emp.json",
 "au2activity":"au2activity.json",
 "au2bmgrfa":"au2bmgrfa.json",
 "req_loc":"req_loc.json",
 "req2au":"req2au.json"
};
//The different forms available in the app
export const FORM_ACTIONS={
    "1":"New Persmissions Form",
   // "2":"Modification to Permissions Form",
    "2":"Removal of Permissions Form"
};
export const REQUESTTYPE_OPTIONS=[
    {value:"-1", label:"Select Request Type"},
    {value:"1", label:"External purchases from outside of the lab"},
    {value:"2", label:"Internal purchases from the lab store, warehouse, and stockroom"},
    {value:"3", label:"Both (Internal and External)"},
    {value:"4", label:"Template Only (Animal room requestor)"}
  ];
