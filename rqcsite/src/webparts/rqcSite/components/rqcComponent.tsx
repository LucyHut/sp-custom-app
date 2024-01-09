import* as React from "react";
import { TabContent, TabPane, Nav, NavItem, NavLink } from "reactstrap";
import classnames from "classnames";

import withAuthProvider from "./views/authProvider";
import { AuthComponentProps } from "./IRqcSiteProps";

import {
   getSubmittermail
 }from "./local_lib/GraphService";
import ErrorMessage from "./ErrorMessage";
import RqcFormOverview from "./Overview";
import RqcFormComponent  from "./views/rqcFormComponent";
import SnFormComponent from "./views/SnFormComponent";
import styles from "./RqcSite.module.scss";

/********************************************************************
 * 
 * This component is a HOC (High Order Component) to render the App.
 * 
 * Author: Lucie Hutchins, DevOps Engineer
 * Department: IT
 * Company: The Jackson Laboratory
 * Date: 2020
 * Modified: 2023 
 * ******************************************************************/

interface IRqcState {
   activeTab: string;
}

class RqcComponent extends React.Component<AuthComponentProps, IRqcState> { 
   constructor(props){
      super(props);
      this.state = {
         activeTab:"3"
      };
   }
   toggleTab(tab:string) {
      if(this.state.activeTab !== tab){
          this.setState({activeTab:tab});
      }
   }
   render(){
     let error = null;
     if (this.props.error) {
       error = <ErrorMessage
         message={this.props.error.message}
         debug={this.props.error.debug} />;
     }
     return (
       <div className={styles.container}>
          <div className={styles.page_header}><h1>RIT Cloud Services Catalog Prototype</h1> </div>
          <Nav className={styles.page_section_nav} tabs>
           <NavItem> 
             <NavLink
                 className={classnames({ active: this.state.activeTab === "1" })}
                 onClick={() => { this.toggleTab("1"); }}
                 style={{cursor:"pointer"}}
                >
                Overview
             </NavLink>
            </NavItem>
               <NavItem>
                  <NavLink
                    className={classnames({ active: this.state.activeTab === "2" })}
                    onClick={() => { this.toggleTab("2"); }}
                    style={{cursor:"pointer"}}
                   >
                   Forms
                </NavLink>
               </NavItem>
              <NavItem>
                  <NavLink
                    className={classnames({ active: this.state.activeTab === "3" })}
                    onClick={() => { this.toggleTab("3"); }}
                    style={{cursor:"pointer"}}
                   >
                   Cloud Services Catalog
                </NavLink>
              </NavItem>
          </Nav>
          <blockquote>
             <TabContent activeTab={this.state.activeTab}>
                 <RqcFormOverview {...this.props}
                   isAuthenticated={this.props.isAuthenticated}
                   user={this.props.user}
                  />
                   <TabPane tabId="2">
                   <RqcFormComponent {...this.props}
                       user_name={this.props.user["displayName"]}
                       user_email={getSubmittermail(this.props.user["email"])}
                       msClientLibrary={this.props.msGraphClientFactory}
                       context={this.props.context}
                       submitterAcctUnits={this.props.userData}/> 
                    </TabPane>
                   <TabPane tabId="3">
                     <SnFormComponent {...this.props}
                       user_name={this.props.user["displayName"]}
                       user_email={getSubmittermail(this.props.user["email"])}
                       msClientLibrary={this.props.msGraphClientFactory}
                       context={this.props.context}
                       submitterAcctUnits={this.props.userData}/> 
                  </TabPane>
               </TabContent>
           </blockquote>
        </div>
     );
  }
 }
 
 export default withAuthProvider(RqcComponent);
