import * as React from "react";
import { Button, TabPane, Row, Col } from "reactstrap";

import styles from "./RqcSite.module.scss";

/* 
 This component renders the main page of the app.

 * Author: Lucie Hutchins,Senior  DevOps Engineer
 * Department: IT
 * Company: The Jackson Laboratory
 * Date: 2020

*/
interface OverviewProps {
    isAuthenticated : boolean;
    user : any;
  }
  
  interface OverviewState {
    isOpen : boolean;
  }  
 
  function OverviewContent(props: OverviewProps) {
    // If authenticated, greet the user
    if (props.isAuthenticated) {
      return (
        <div>
          <b>Click on the "Forms" tab to get started.</b>
        </div>
      );
    }
    // Not authenticated, present a sign in button
    return <Button color="primary">You must sign in with your JAX credentials in order to access the forms</Button>;
  }
export default class RqcFormOverview extends React.Component<OverviewProps, OverviewState>  {
   render(){
    return (
        <TabPane tabId="1">
            <Row>
                <Col sm="12">
                       <div className={styles.section_header} ><h2>Who Should Use This App</h2></div>
                      <blockquote className={styles.overview_section}>
                      <div>
                        <p>
                        The RQC Access App is a tool that allows Budget Admins, Budget Managers, and Financial Analysts to Request, 
                        or Remove an employee’s permissions to submit internal and/or external requisitions in Lawson.
                        In order to use the App, the user of the app should be associated to at least one active accounting unit or 
                        at least one grant activity for Grant Financial Analysts.
                       </p>
                       <p> Note that an employee cannot request their own permissions.
                          If you need access to Lawson RQC Purchasing, ​please have someone in your department who is either a budget admin, 
                          a budget manager, a financial analyst at the AU level, 
                          or a Grant Financial analyst (at the activity level) submit the New RQC Requestor Form  on your behalf. 
                          Once your access has been set up in Lawson, you will be contacted by a member of Purchasing to set up a date/time for training as needed. 
                          For additional information, please contact purchasing@jax.org. 
                       </p>
                       </div>
                       <div className={styles.section_header}><h2>HOW IT WORKS</h2></div>
                       <div>
                        <p>
                       The App is integrated with Microsoft Outlook and Service-now’s RQC process flow. 
                       For example, when you submit a request for new permissions, an Outlook  email screen should open up.
                       The content of the email should include all the information you entered in the form. 
                       </p>
                       <p>
                        If after you click on "Submit" the form, the Outlook email body is empty, cancel the Outlook email and 
                        try using a different browser - This is a browser compatibility issue and it's been reported with Internet Explorer and older browsers in some cases.
                          However, if everything looks good in the body of the email, click on "Send" email to submit your request to service-now. 
                         Once the email is sent, the following sequence of service-now events will follow:
                       </p>
                       <ol>
                          <li>A ticket will be created in service-now and assigned to Lawson team</li>
                          <li>Lawson team configures the employee listed in the new request with Lawson requestor security role</li>
                          <li>Lawson team closes this first task which triggers a new task to setup the requestor profile</li>
                          <li>The Requestor profile setting task is created and assigned to Lawson team as a proxy to purchasing team (Purchasing is added to the watch list)</li>
                          <li>Email sent out to purchasing with the request to setup a new requestor profile in lawson</li>
                          <li>Purchasing creates the requestor profile and updates the task that this step is complete</li>
                          <li>Note: If Punchout access was granted to the requester, Purchasing should update the task with that information </li>
                          <li>Lawson team close the task - Closing the requestor profile task triggers a new task to train the new requestor</li>
                          <li>Requestor training task is created and assigned to Lawson team as proxy to purchasing team (Purchasing is added to the watch list)</li>
                          <li>Purchasing trains the new requestor and update task to close</li>
                          <li>Note: if Punchout access was granted, Lawson team should create and IT ticket to add the user to GRP-AmazonBusiness</li>
                          <li>Done</li>
                        </ol>  
                        </div>
                         <OverviewContent 
                             isAuthenticated={this.props.isAuthenticated} 
                              user={this.props.user}
                         />
                        </blockquote>
                        <blockquote className={styles.sub_section_header}>
                        <dl>
                        <dt className={styles.section_header}><h3>Types of Forms:</h3></dt>
                        <dd>
                            <ul>
                                <li><b>New Persmissions Form:</b> 
                                   Use this form to request permissions for an employee to submit internal and/or external requisitions in Lawson.
                                   Completion of this form will trigger the RQC Access Request process flow in Service-now.  
                                </li>
                                <li><b>Removal of Permissions Form:</b>
                                    Use this form to remove permissions for an employee to submit internal and/or external requisitions in Lawson. 
                                    Completion of this form will trigger the RQC Access Removal process flow in Service-now.
                                 </li>
                            </ul>
                        </dd>
                        </dl>
                        <dl>
                        <dt className={styles.section_header}><h3>Types of Purchases:</h3></dt>
                        <dd>
                            <ul>
                                <li>External purchases from outside of the lab.</li>
                                <li>Internal purchases from the lab store, warehouse, and stockroom.</li>
                                <li>Both (Internal and External)</li>
                                <li>Template Only (Animal room requestor)</li>
                            </ul>
                        </dd>
                        </dl>
                        <div className={styles.section_header}>
                            <h2>Browsers Compatibility -  The application works on</h2>
                            </div>
                        <dl>
                         <dt></dt> 
                          <dd>
                            <ul>
                              <li>MacOS: Chrome and Firefox browsers</li>
                              <li>Windows: Chrome, Firefox, and other browsers</li>
                            </ul>
                          </dd>
                        </dl>
                        <div className={styles.section_header}><h2>Known Issues</h2></div>
                        <dl>
                          <dt><h4>The application does not works on</h4></dt>
                          <dd>
                            <ul>
                              <li>MacOS: Safari browser</li>
                              <li>Internet Explorer: Some people have reported issues with IE</li>
                              <li>Older browsers: Some people have reported issues with Netscape</li>
                            </ul>
                          </dd>
                        </dl>
                        <dl>
                          <dt><h4>Problem rendering the App</h4></dt>
                          <dd>
                            <p>
                               <h5>The App's page renders the following message:</h5>
                               <em>Something went wrong
                                 If the problem persists, 
                                contact the site administrator and give them the information in Technical Details.
                               </em>
                             </p>
                             <p>
                               <h5>Solution:</h5>
                                <ol>
                                  <li>Logout of the App's page to sign out of Office 365 </li>
                                  <li>Logout of myjax</li>
                                  <li>Close the browser</li>
                                  <li>Then try again to access the App's page</li>
                                </ol>
                            </p>
                          </dd>
                        </dl>
                        <div className={styles.section_header}><h2>HOW TO REPORT ISSUES AND SUGGESTIONS</h2></div>
                        <dl>
                          <dt></dt>
                          <dd>
                            <ol>
                            <li>For Software Related Issues, send an email to helpdesk@jax.org and Cc lucie.hutchins@jax.org</li> 
                            <li>You get "Access denied" even when you meet the requirements: send an email to purchasing@jax.org and cc: lucie.hutchins@jax.org </li>
                            <li>Suggestions: send an email to Kristin.collins@jax.org and cc: fis@jax.org ; purchasing@jax.org</li>
                            </ol>
                          </dd>
                        </dl>
                     </blockquote>
               </Col>
            </Row>
           
         </TabPane>
    );
  }
}
