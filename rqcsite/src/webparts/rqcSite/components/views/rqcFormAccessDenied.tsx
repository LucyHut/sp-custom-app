import * as React from "react";
import { Row, Col } from "reactstrap";
import styles from "./../RqcSite.module.scss";
/* 
 This component is returns the access denied view

 * Author: Lucie Hutchins, DevOps Engineer
 * Department: IT
 * Company: The Jackson Laboratory
 * Date: 2020

*/
const RqcFormAccessDenied = (props: any) => {
    return (
            <Row>
                <Col sm="12">
                <div className={styles.section_header}><h2>{props.user_name}: Access Denied</h2></div>
                <blockquote className={styles.overview_section}>
                   <div>
                      <b>You do not have permissions to use the RQC Forms.</b>
                       <p>RQC forms should be used by  <b>Budget Admins</b>, <b>Budget Managers</b>,
                        or <b>Financial Analysts</b> ONLY. 
                        In addition, the user of the App should be associated to at least one active accounting unit or grant activity.
                     If you believe this is a mistake - you are either a 
                    Budget Admin, a Budget Manager or a Financial Analyst and assigned to at least one active accounting unit, 
                   please contact Finance at <b>fsis@jax.org</b> 
                    </p>
                </div>
                <div>
                    <b>NOTE:</b>
                    <p>
                        The App's backend data models are refreshed once a day. If you are a newly assigned Budget Admin, Budget Manager
                        or Financial Analyst to an accounting unit or grant activity, please wait at least one day - or until the next data refresh - before you start using this App.
                
                    </p>
                </div>
            </blockquote>
            </Col>
        </Row>
    );
};
export default RqcFormAccessDenied;
