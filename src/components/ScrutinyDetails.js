import React, { Component } from "react";
import "./css/ScrutinyDetails.css";
import { Link,useParams,useLocation } from "react-router-dom";

class ScrutinyDetails extends Component {
  constructor(props) {
    super(props);
    const { state } = props.location || {};
    this.state = {
      isScrutinyDone: "",
      scrutinyDate: "",
      name: "",
      designation: "",
      ssoId: "",
      remarks: "",
      appealNo : state?.appealNo || 'Appl-GST-2025' ,
    };
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "isScrutinyDone" && value !== "Yes") {
      this.setState({ scrutinyDate: "" });
    }
    this.setState({ [name]: value });
  };

  handleSSOChange = (e) => {
    const { value } = e.target;
    const alphanumeric = /^[a-zA-Z0-9_/\-@.#]*$/;
    if (value === "" || alphanumeric.test(value)) {
      this.setState({ ssoId: value });
    }
  };

  handleBack = () => {
    alert("⬅️ Back to Receipt");
    // this.props.navigate('/');

  };

  handleSubmit = () => {
    const { isScrutinyDone, scrutinyDate, name, designation, ssoId, remarks } = this.state;

    if (!isScrutinyDone) return alert("Please select whether scrutiny is done.");
    if (isScrutinyDone === "Yes" && !scrutinyDate) return alert("Please enter Scrutiny Date.");
    if (!name || !designation || !ssoId || !remarks)
      return alert("Please fill out all required fields.");

    console.log("✅ Form Submitted with Data:", {
      isScrutinyDone,
      scrutinyDate,
      name,
      designation,
      ssoId,
      remarks,
    });

    alert("✅ Details Submitted Successfully!");
  };

  render() {
    const { isScrutinyDone, scrutinyDate, name, designation, ssoId, remarks } = this.state;

    return (
      <div className="scrutiny-container">
        <div className="scrutiny-header">Scrutiny Details - Appeal No : {this.state.appealNo}</div>
        <div className="scrutiny-section-title">Scrutiny Information</div>

        <table className="scrutiny-table">
          <tbody>
            <tr>
              <td>
                <div className="input-group">
                  <select
                    id="isScrutinyDone"
                    name="isScrutinyDone"
                    value={isScrutinyDone}
                    onChange={this.handleChange}
                    className={`floating-input ${isScrutinyDone ? "filled" : ""}`}
                  >
                    <option value="" disabled hidden></option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  <label htmlFor="isScrutinyDone" className="floating-label">
                    Scrutiny Done
                  </label>
                </div>
              </td>

              <td>
                {isScrutinyDone === "Yes" && (
                  <div className="input-group">
                    <input
                      id="scrutinyDate"
                      type="date"
                      name="scrutinyDate"
                      value={scrutinyDate}
                      onChange={this.handleChange}
                      className={`floating-input ${scrutinyDate ? "filled" : ""}`}
                    />
                    <label htmlFor="scrutinyDate" className="floating-label">
                      Scrutiny Date
                    </label>
                  </div>
                )}
              </td>
            </tr>

            <tr>
                <td>
                <div className="input-group">
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={name}
                    onChange={this.handleChange}
                    className={`floating-input ${name ? "filled" : ""}`}
                  />
                  <label htmlFor="name" className="floating-label">Officer Name</label>
                </div>
                </td>
                
                <td>
                <div className="input-group">
                  <select name="designation" id='designation' value={designation} className={`floating-input ${designation ? 'filled' : ""}`} onChange={this.handleChange}>
                    <option value='' disabled hidden></option>
                    <option value='Inspector'>Inspector</option>
                    <option value='Superintendent'>Superintendent</option>
                    <option value='AC / DC'>AC / DC</option>
                    <option value='Inspector / TA'>Inspector / TA</option>
                  </select>
                  <label htmlFor="designation" className="floating-label">Designation</label>
                </div>
                </td>

                <td>
                <div className="input-group">
                  <input
                    id="ssoId"
                    type="text"
                    name="ssoId"
                    value={ssoId}
                    onChange={this.handleSSOChange}
                    className={`floating-input ${ssoId ? "filled" : ""}`}
                  />
                  <label htmlFor="ssoId" className="floating-label">SSO ID</label>
                </div>
                </td>
            </tr>

            <tr>
              <td>
                <div className="input-group">
                  <textarea
                    id="remarks"
                    name="remarks"
                    value={remarks}
                    onChange={this.handleChange}
                    className={`floating-input ${remarks ? "filled" : ""}`}
                  />
                  <label htmlFor="remarks" className="floating-label">Remarks</label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="button-container">
          <Link to='/'>
                <button className="btn back-btn" onClick={this.handleBack}>⬅️ Back to Receipt</button>
          </Link>
          <button className="btn submit-btn" onClick={this.handleSubmit}>Submit</button>
        </div>
      </div>
    );
  }
}

function withLocation(Component){
  return (props) => {
    const location = useLocation();
    return <Component {...props} location={location} />
  }; 
}
export default withLocation(ScrutinyDetails);
