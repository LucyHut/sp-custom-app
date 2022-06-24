import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";

import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";

//import * as strings from "RqcSiteWebPartStrings";

import RqcSite from "./components/RqcSite";
import { AuthComponentProps } from "./components/IRqcSiteProps";

export default class RqcSiteWebPart extends BaseClientSideWebPart <AuthComponentProps> {
   render(): void {
     let isAuthenticated=true;
     if(this.context.pageContext.user.isAnonymousGuestUser || this.context.pageContext.user.isExternalGuestUser){
       isAuthenticated=false;
    }
    const element: React.ReactElement<AuthComponentProps> = React.createElement(
      RqcSite,
      {
        user: this.context.pageContext.user,
        msGraphClientFactory: this.context.msGraphClientFactory,
        context: this.context,
        error: this.properties.error,
        isAuthenticated: isAuthenticated,
        userData: this.properties.userData
        
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }
}
