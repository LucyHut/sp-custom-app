import* as React from "react";
import { MSGraphClient } from "@microsoft/sp-http";
import axios from "axios";

import {
  getGraphEndpoint,
  getModelMetadata,
  getSubmittermail
}from "./../local_lib/GraphService";

/* 
 This component is a HOC (High Order Component) to wrap around RQC Form Components.
 The AuthProvider HOC contains all of the logic for checking that the user is authenticated.

 * Author: Lucie Hutchins, DevOps Engineer
 * Department: IT
 * Company: The Jackson Laboratory
 * Date: 2020

*/

import { AuthComponentProps } from "./../IRqcSiteProps";
  
interface AuthProviderState {
    error: any;
    isAuthenticated: boolean;
    user: any;
    userData: any;
}
export default function withAuthProvider<T extends React.Component<AuthComponentProps>>
     (WrappedComponent: new(props: AuthComponentProps, context?: any) => T): React.ComponentClass {
     return class extends React.Component<any, AuthProviderState> {
       constructor(props: any) {
          super(props);
          this.state = {
            error: null,
            isAuthenticated: false,
            user: {},
            userData: {}
          };
       }
       
       componentDidMount(){
          this.setUserAuth();
       }
        render() {
        return <WrappedComponent 
          error = { this.state.error }
          isAuthenticated = { this.state.isAuthenticated }
          user = { this.state.user }
          userData= { this.state.userData}
          msGraphClientFactory={this.props.msGraphClientFactory}
          context={this.props.context}
          {...this.props}{...this.state} />;
      }
       capitalizeFirstCharacter(token:string){
         if(token){
            return token.charAt(0).toUpperCase() + token.slice(1);
         }else{ return token; }
       }
       setUserAuth() {
        if( this.props.user.isAnonymousGuestUser || this.props.user.isExternalGuestUser){
          this.setState({
            isAuthenticated: false,
            user: {},
            error: null
          });
        }else{
          const user_email= this.props.user.email || this.props.user.loginName ||this.props.user.userPricipalName;
          this.getAccountingUnits(user_email);
          this.setState({
            isAuthenticated: true,
            user: {
              displayName: this.props.user.displayName,
              email: user_email
            },
            error: null
          });
        }
      }
      
      //get this user data
      /*
      * fetching the content of a model file from MS document library 
      *    in the cloud is a two-step process:
      *  1) call graph api to get the downloadUrl
      *  2) uses axios to fetch the model file from MS document library
      */
      async getAccountingUnits(user_email:string){
          this.props.msGraphClientFactory
          .getClient()
          .then((client: MSGraphClient) => {
             client
               .api(getGraphEndpoint("au2bmgrfa"))
               .version("v1.0")
               .get((err, res)=>{
                  if(err){
                    console.error(err);
                    return;
                  }
                  let model=getModelMetadata(res.value,"au2bmgrfa.json");
                  axios.get(model["@microsoft.graph.downloadUrl"]).then((result)=>{
                     let emp_data={};
                     user_email=getSubmittermail(user_email);
                     for(var index in result.data){
                         const userObj=result.data[index];
                         if(userObj["emp_email"].toLowerCase() === user_email.toLowerCase()){
                            if(!emp_data["email"]){
                                emp_data["email"]=user_email;
                                emp_data["name"]=this.props.user.displayName;
                                emp_data["emp_id"]=userObj["emp_id"];
                                emp_data["aus"]={};
                             }
                            const acct_unit=[userObj["acct_unit"]];
                            acct_unit["desc"]="";
                            emp_data["aus"][acct_unit]=acct_unit;
                        }
                    }
                   this.setState({
                       userData: emp_data
                    });
                 });
      
              });
          });
      }
  };
}
