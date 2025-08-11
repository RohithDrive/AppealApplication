import React from 'react';
import './css/AppealReciept.css'
import {Link,Navigate,navigate} from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

class AppealReciept extends React.Component{
    constructor(props){
        super(props);
        this.state={
            applicantInfo:{
                gstin:'',
                applicantType:'',
                taxation:'',
                authAppeallate: '',
                appealNo:'',
                arnNo:'',
                legalName:'',
                tradeName:'',
                recieptDate:'',
                appealFillingDate:'',
                taxpayerAddress1:'',
                email1:'',
                phone1:'',
                altEmail1:'',
                altPhone1:'',
                actAsRepresent:'',
                authPersonName:'',
                authRepresentType:'',
                taxpayerAddress2:'',
                email2:'',
                phone2:'',
                altEmail2:'',
                altPhone2:''
            },
            oioDetails:{
                oioNo:'',
                orderDate:'',
                communicationDate:'',
                commissionerate:'',
                authOriginalDesignation:'',
                orderType:'',
                formation:'',
                demand: 0,
                interest: 0,
                penality: 0,
                lateFee: 0,
                redemtionFine: 0,
                refund: 0,
                otherAmount: '',
                totalSum: 0.00,
                amountInWords:'',
                predeposit: '',
                recievedoioCopy:'',
                issue:''
            },
            groundAppeal:{
                appealFacts:'',
                groundsOfAppeal:'',
                prayer:'',
            },
            docs:{
                impugnedOrder:null,
                scnCopy:null,
                predepositPayment:null,
                authLetter:null,
                supportingDocs:null,
            },
            appealReciept:{
                occDate:'',
                appealRecieptDate:'',
                appealIsInTime:'',
                delayRequest:'',
                appealStamp:'',
                oioStamp:'',
                authAnyOne:'',
                authvalid:'',
                phRequest:'',
            },
            formStage : 'edit', // form stage editing or previewing
            buttonMode : 'preview', // button name by stage (Preview or Submit)
            showPopUp : false, // Allow default showing the PopUp
            dataTransfer : false
        };
        this.enableAmountInWords = true; // auto words Disables
        this.fileInputRef={
            impugnedOrder : React.createRef(),
            scnCopy : React.createRef(),
            authLetter : React.createRef(),
            supportingDocs : React.createRef()
        };
    };

    convertToWords = (num) => {
        if (isNaN(num)) return '';

        const a = [
            '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
            'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
            'Seventeen', 'Eighteen', 'Nineteen'
        ];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        const numberToWords = (n) => {
            if (n < 20) return a[n];
            if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
            if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + numberToWords(n % 100) : '');
            if (n < 100000) return numberToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + numberToWords(n % 1000) : '');
            if (n < 10000000) return numberToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + numberToWords(n % 100000) : '');
            return numberToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + numberToWords(n % 10000000) : '');
        };

        const numParts = Number(num).toFixed(2).toString().split(".");
        const whole = parseInt(numParts[0]);
        const fraction = parseInt(numParts[1]);

        let result = '';
        if (whole > 0) result += numberToWords(whole) + ' Rupees';
        if (fraction > 0) result += ' and ' + numberToWords(fraction) + ' Paise';
        if (result === '') result = 'Zero Rupees';
    
        return result + ' Only';
    };


    handleChange = (e) => {
        const { name, type, value, files } = e.target;
        if(type === 'file'){
            const file = files[0];// set = files to allow multiple files
            if (!file) return;
            // upload or replace in 1st attempt
            this.setState(prevState => ({
                docs : { ...prevState.docs, [name] : file }
            }));
            // allow reupload in 1st attempt
            setTimeout(() => {
                if (this.fileInputRef[name]?.current){
                    this.fileInputRef[name].current.value = null;
                }
            }, 0);
        }else{
            this.setState(prevState => {
                // handle applicantInfo Updation
                if(prevState.applicantInfo.hasOwnProperty(name)){
                    return { applicantInfo:{ ...prevState.applicantInfo, [name] : value } };
                }
                //handle oioDetails Updation
                if(prevState.oioDetails.hasOwnProperty(name)){
                    const isNumberField =['demand','interest','penality','lateFee','redemtionFine','refund','otherAmount'].includes(name);
                    const updated = { ...prevState.oioDetails, [name] : value === '' ? (isNumberField ? 0 : '') : (isNumberField ? Number(value) : value) };
                    //Auto adding TotalSum
                    let fieldsToSum = ['demand','interest','penality','lateFee','redemtionFine','refund','otherAmount'];
                    let total = fieldsToSum.reduce((acc, key) => acc + (parseFloat(updated[key]) || 0), 0);
                    updated.totalSum = total.toFixed(2);

                    //Auto - words convert setting - True
                    if(this.enableAmountInWords){
                        updated.amountInWords = this.convertToWords(total);
                    }
                    //Manual - words entry setting - False
                    else if ( name === 'amountInWords' ){
                        updated.amountInWords = value;
                    }
                    return { oioDetails : updated };
                }
                // handle groundAppeal Details
                if(prevState.groundAppeal.hasOwnProperty(name)){
                    return{ groundAppeal: { ...prevState.groundAppeal, [name]: value}};
                }
                // handle appeal Reciept Details
                if(prevState.appealReciept.hasOwnProperty(name)){
                    return { appealReciept: { ...prevState.appealReciept, [name]: value } };
                }
                return null;
            });
        }
    };

    /*Drop Function for files input*/
    handleFileDrop = (e, fieldName) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (!file) return;
        // upload or replace immediately
        this.setState(prevState => ({
            docs: {...prevState.docs,[fieldName]: file }
        }));
        // allow same or differ file to upload again
        setTimeout(() => {
            if (this.fileInputRef[fieldName]?.current) {
                this.fileInputRef[fieldName].current.value = null;
            }
        }, 0);
    };

    // Button Name based on form state
    handlePrimaryAction = () => {
        const { buttonMode } = this.state;
        if (buttonMode === 'preview'){
            // Go to Preview
            this.setState({ formStage: 'preview' });
        }
        else if (buttonMode === 'submit'){
            // go to Submit function
            this.handleSubmit();
        }
    };

    handleSubmit = (e) => {
        e.preventDefault();
        this.setState({ dataTransfer : true });
        alert('✅ Appeal submitted Successfully ! ');
    };

    handleSave = () => {
        alert('✅ Appeal Reciept was Saved Succesfully !');
        this.setState({ showPopUp : true });
    };

    handleBack = () => {
        this.setState({ showPopUp : false, formStage : 'edit' });
        // this.setState({ formStage:'edit', buttonMode:'submit' });
    };

    // handleDownload = async () => {
    //     const element = document.querySelector('.Appeal-Reciept-container');
    //     if(!element){ alert('Element Not Found !'); return; }
    //     await document.fonts.ready;
    //     const canvas = await html2canvas(element, { scale : 10, useCORS : true, backgroundColor: '#ffffff', scrollY: 0 });
    //     const imgData = canvas.toDataURL('image/png');
    //     const pdf = new jsPDF('p','mm','legal');
    //     const pdfWidth = pdf.internal.pageSize.getWidth();
    //     const pdfHeight = pdf.internal.pageSize.getHeight();
    //     const imgWidth = pdfWidth;
    //     const imgHeight = (canvas.height * imgWidth) / canvas.width;
    //     let heightLeft = imgHeight;
    //     let position = 0;
    //     pdf.addImage( imgData, 'PNG', 0, position, imgWidth, imgHeight);
    //     heightLeft -= pdfHeight;
    //     while (heightLeft > 0){
    //         position -= pdfHeight;
    //         pdf.addPage('legal','p');
    //         pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    //         heightLeft -= pdfHeight;
    //     }
    //     pdf.save(`Appeal - ${this.state.applicantInfo.appealNo}.pdf`);
    // };

    handleDownload = () => { 
        let pdfElement = document.querySelector('.print-preview-only');
        if (!pdfElement) { alert('PDF Element was not Found !'); return; };
        pdfElement.style.transform = 'scale(0.95)';
        pdfElement.style.transformOrigin = 'top left';
        window.print();
        setTimeout (() => { pdfElement.style.transform = ''; }, 1000);
    };

    

    render(){
        return(
            <>
            <div className='AppealReciept'>
                {this.state.formStage === 'edit' && (
                <div className='Appeal-container'>
                    <div id='Appeal-header'>
                        <h1>Create New Appeal</h1>
                        <h4>Appeal Reciept --------- Scrutiny ----------- Personal Hearing ------- Dispatch</h4>
                    </div>
                    <div id='Appeal-body'>
                        {/*Applicant info*/}
                        <h2>Applicant Information</h2>
                            <table className='applicant-info'>
                                <tbody>
                                <tr>
                                    <td>
                                        <div className="floating-group">
                                            <input type='text' name='gstin' id='gstin' pattern="[A-Za-z0-9_/\-]*" value={this.state.applicantInfo.gstin} className={`floating-input ${this.state.applicantInfo.gstin ? "filled" : "" }`} onChange={this.handleChange} required />
                                            <label htmlFor='gstin'className='floating-label' >PAN/GSTIN/Registration Number</label>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="floating-group">
                                            <select id='applicantType' name='applicantType' value={this.state.applicantInfo.applicantType} className={`floating-input ${this.state.applicantInfo.applicantType ? "filled" : ""}`} onChange={this.handleChange} required >
                                                <option value='' disabled hidden></option>
                                                <option value='Individual'>Individual</option>
                                                <option value='Company'>Company</option>
                                                <option value='Firm'>Firm</option>
                                                <option value='Department'>Department</option>
                                            </select>
                                            <label htmelFor='applicantType' className='floating-label'>Applicant Type</label>
                                        </div>
                                    </td>
                                    <td>
                                        <div className='floating-group'>
                                            <select id='taxation' name='taxation' value={this.state.applicantInfo.taxation} className={`floating-input ${this.state.applicantInfo.taxation ? 'filled' : ''}`} onChange={this.handleChange} required >
                                                <option value='' disabled hidden></option>
                                                <option value='GST'>GST</option>
                                                <option value='Service Tax'>Service Tax</option>
                                                <option value='Customs'>Customs</option>
                                                <option value='Central Excise'>Central Excise</option>
                                            </select>
                                            <label htmlFor='taxation' className='floating-label'>Taxation</label>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className='floating-group'>
                                            <input type='text' name='appealNo' id='appealNo' pattern="[A-Za-z0-9_/\-]*" value={this.state.applicantInfo.appealNo} className={`floating-input ${this.state.applicantInfo.appealNo ? "filled" : ""}`} onChange={this.handleChange} required />
                                            <label htmlFor='appealNo' className='floating-label'>Appeal Number</label>
                                        </div>
                                    </td>
                                    <td>
                                        <div className='floating-group'>
                                            <input type='text' name='arnNo' id='arnNo' pattern="[A-Za-z0-9_/\-]*" value={this.state.applicantInfo.arnNo} className={`floating-input ${this.state.applicantInfo.arnNo ? "filled" : ""}`}  onChange={this.handleChange} required />
                                            <label htmlFor='arnNo' className='floating-label'>ARN(Appeal Reference Number)</label>
                                        </div>
                                    </td>
                                    <td>
                                        <div className='floating-group'>
                                            <input type='date' name='recieptDate' id='recieptDate' value={this.state.applicantInfo.recieptDate} className={`floating-input ${this.state.applicantInfo.recieptDate ? "filled" : ""}`} onChange={this.handleChange} required />
                                            <label htmlFor='recieptDate' className='floating-label'>Date of Reciept</label>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className='floating-group'>
                                            <input type='date' name='appealFillingDate' id='appealFillingDate' value={this.state.applicantInfo.appealFillingDate} className={`floating-input ${this.state.applicantInfo.appealFillingDate ? 'filled' : '' }`} onChange={this.handleChange} required />
                                            <label htmlFor='appealFillingDate' className='floating-label'>Date of Appeal Filling (Online)</label>
                                        </div>
                                    </td>
                                    <td>
                                        <div className='floating-group'>
                                            <select name='authAppeallate' id='authAppeallate' value={this.state.applicantInfo.authAppeallate} className={`floating-input ${this.state.applicantInfo.authAppeallate ? 'filled' : '' }`} onChange={this.handleChange} required >
                                                <option value='' disabled hidden></option>
                                                <option vlaue='Commissioner' >Commissioner</option>
                                                <option value='AC / DC' >AC / DC</option>
                                            </select>
                                            <label htmlFor='authAppeallate' className='floating-label'>Authorised Appeallate</label>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className='floating-group'>
                                            <input type='text' name='legalName' id='legalName' value={this.state.applicantInfo.legalName} className={`floating-input ${this.state.applicantInfo.legalName ? 'filled' : '' }`} onChange={this.handleChange} required />
                                            <label htmlFor='legalName' className='floating-label'>Legal Name</label>
                                        </div><br />
                                        <div className='floating-group'>
                                            <input type='text' name='tradeName' id='tradeName' value={this.state.applicantInfo.tradeName} className={`floating-input ${this.state.applicantInfo.tradeName ? 'filled' : '' }`} onChange={this.handleChange} required />
                                            <label htmlFor='tradeName' className='floating-label'>Trade Name</label>
                                        </div>
                                    </td>
                                    <td colSpan={3}>
                                        <div className='floating-group'>
                                            <textarea name='taxpayerAddress1' id='taxpayerAddress1' value={this.state.applicantInfo.taxpayerAddress1} className={`floating-input ${this.state.applicantInfo.taxpayerAddress1 ? 'filled' : ''}`} onChange={this.handleChange} required ></textarea>
                                            <label htmlFor='taxpayerAddress1' className='floating-label'>Complete Address of Tax Payer</label>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className='floating-group'>
                                            <input type='email' name='email1' id='email1' value={this.state.applicantInfo.email1} className={`floating-input ${this.state.applicantInfo.email1 ? 'filled' : "" }`} onChange={this.handleChange} required />
                                            <label htmlFor='email1' className='floating-label'>Email ID </label>
                                        </div>
                                    </td>
                                    <td>
                                        <div className='floating-group'>
                                            <input type='tel' name='phone1' id='phone1' value={this.state.applicantInfo.phone1} className={`floating-input ${this.state.applicantInfo.phone1 ? 'filled' : "" }`} onChange={this.handleChange} required />
                                            <label htmlFor='phone1' className='floating-label'>Contact Number</label>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className='floating-group'>
                                            <input type='email' name='altEmail1' id='altEmail1' value={this.state.applicantInfo.altEmail1} className={`floating-input ${this.state.applicantInfo.altEmail1 ? 'filled' : "" }`} onChange={this.handleChange} placeholder='Not Mandatory' />
                                            <label htmlFor='altEmail1' className='floating-label'>Alternate Email ID </label>
                                        </div>
                                    </td>
                                    <td>
                                        <div className='floating-group'>
                                            <input type='tel' name='altPhone1' id='altPhone1' value={this.state.applicantInfo.altPhone1} className={`floating-input ${this.state.applicantInfo.altPhone1 ? 'filled' : "" }`} onChange={this.handleChange} placeholder='Not Mandatory' />
                                            <label htmlFor='altPhone1' className='floating-label'>Alternate Contact Number</label>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan='3'>
                                    <div className="floating-group radio-group">
                                        <label htmlFor='actAsRepresent' className='radio-label' >Whether the Party has Authorised anyone to Act as Representative : -
                                            <input type='radio' name='actAsRepresent' id='actAsRepresent' value='Yes' checked={this.state.applicantInfo.actAsRepresent === 'Yes'} onChange={this.handleChange} required />{'  '} Yes 
                                            <input type='radio' name='actAsRepresent' id='actAsRepresent' value='No' checked={this.state.applicantInfo.actAsRepresent === 'No'} onChange={this.handleChange} required />{'  '} No 
                                        </label>
                                    </div>    
                                    </td>
                                </tr>

                                {/* Other Auth. Person details fields */}
                                {this.state.applicantInfo.actAsRepresent === 'Yes' && (
                                <>
                                <tr>
                                    <td>
                                        <div className='floating-group'>
                                            <input type='text' name='authPersonName' id='authPersonName' value={this.state.applicantInfo.authPersonName} className={`floating-input ${this.state.applicantInfo.authPersonName ? 'filled' : '' }`} onChange={this.handleChange} required />
                                            <label htmlFor='authPersonName' className='floating-label'>Name of Authorised Person</label>
                                        </div><br />
                                        <div className='floating-group'>
                                            <select id='authRepresentType' name='authRepresentType' value={this.state.applicantInfo.authRepresentType} className={`floating-input ${this.state.applicantInfo.authRepresentType ? 'filled' : ""}`} onChange={this.handleChange} required >
                                                <option value='' disabled hidden></option>
                                                <option value='Consultant'>Consultant</option>
                                                <option value='CA'>CA</option>
                                                <option value='Advocate'>Advocate</option>
                                                <option value='Authorised Person'>Authorised Person</option>
                                            </select>
                                            <label htmlFor='authRepresentType' className='floating-label'>Authorised Representative Designation</label>
                                        </div>
                                    </td>
                                    <td colSpan={3}>
                                        <div className='floating-group'>
                                            <textarea name='taxpayerAddress2' id='taxpayerAddress2' value={this.state.applicantInfo.taxpayerAddress2} className={`floating-input ${this.state.applicantInfo.taxpayerAddress2 ? 'filled' : ''}`} onChange={this.handleChange} required ></textarea>
                                            <label htmlFor='taxpayerAddress2' className='floating-label'>Complete Address of Tax Payer</label>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className='floating-group'>
                                            <input type='email' name='email2' id='email2' value={this.state.applicantInfo.email2} className={`floating-input ${this.state.applicantInfo.email2 ? 'filled' : "" }`} onChange={this.handleChange} required/>
                                            <label htmlFor='email2' className='floating-label'>Email ID </label>
                                        </div>
                                    </td>
                                    <td>
                                        <div className='floating-group'>
                                            <input type='tel' name='phone2' id='phone2' value={this.state.applicantInfo.phone2} className={`floating-input ${this.state.applicantInfo.phone2 ? 'filled' : "" }`} onChange={this.handleChange} required />
                                            <label htmlFor='phone2' className='floating-label'>Contact Number</label>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className='floating-group'>
                                            <input type='email' name='altEmail2' id='altEmail2' value={this.state.applicantInfo.altEmail2} className={`floating-input ${this.state.applicantInfo.altEmail2 ? 'filled' : "" }`} onChange={this.handleChange} placeholder='Not Mandatory' />
                                            <label htmlFor='altEmail2' className='floating-label'>Alternate Email ID </label>
                                        </div>
                                    </td>
                                    <td>
                                        <div className='floating-group'>
                                            <input type='tel' name='altPhone2' id='altPhone2' value={this.state.applicantInfo.altPhone2} className={`floating-input ${this.state.applicantInfo.altPhone2 ? 'filled' : "" }`} onChange={this.handleChange} placeholder='Not Mandatory' />
                                            <label htmlFor='altPhone2' className='floating-label'>Alternate Contact Number</label>
                                        </div>
                                    </td>
                                </tr>
                                </>
                                )}
                                </tbody>
                            </table>

                        {/*OIO info*/}
                        <h2>Order-In-Original Details</h2>
                        <table className='oioDetails'>
                            <tbody>
                            <tr>
                                <td>
                                    <div className='floating-group'>
                                        <input type='text' name='oioNo' id='oioNo' pattern="[a-zA-Z0-9_/\-]*" value={this.state.oioDetails.oioNo} className={`floating-input ${this.state.oioDetails.oioNo ? 'filled' : '' }`} onChange={this.handleChange} required/>
                                        <label htmlFor='oioNo' className='floating-label'>OIO Number</label>
                                    </div>
                                </td>
                                <td>
                                    <div className='floating-group'>
                                        <input type='date' name='orderDate' id='orderDate' value={this.state.oioDetails.orderDate} className={`floating-input ${this.state.oioDetails.orderDate ? 'filled' : '' }`} onChange={this.handleChange} required/>
                                        <label htmlFor='orderDate' className='floating-label'>Order Date.</label>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div className='floating-group'>
                                        <input type='date' name='communicationDate' id='communicationDate' value={this.state.oioDetails.communicationDate} className={`floating-input ${this.state.oioDetails.communicationDate ? 'filled' : '' }`} onChange={this.handleChange} required/>
                                        <label htmlFor='communicationDate' className='floating-label'>Communication Date/DRC-07</label>
                                    </div>
                                </td>
                                
                                <td>
                                    <div className='floating-group'>
                                        <select id='commissionerate' name='commissionerate' value={this.state.oioDetails.commissionerate} className={`floating-input ${this.state.oioDetails.commissionerate ? 'filled' : ""}`} onChange={this.handleChange} required>
                                                <option value='' disabled hidden></option>
                                                <option value='RangaReddy'>RangaReddy - RR</option>
                                                <option value='Hyderabad'>Hyderabad - HYD</option>
                                                <option value='HYD-Customs'>HYD - Customs</option>
                                        </select>
                                        <label htmlFor='commissionerate' className='floating-label'>Commissionerate</label>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan='3'>
                                    <div className="floating-group radio-group">
                                        <label htmlFor='authOriginalDesignation' className='radio-label'>Designation of Original Adjudicatory Authority : -<br /><br />
                                            <input type='radio' name='authOriginalDesignation' value='Additional Commissioner' checked={this.state.oioDetails.authOriginalDesignation === 'Additional Commissioner'} onChange={this.handleChange} required/> Additional Commissioner

                                            <input type='radio' name='authOriginalDesignation' value='Joint Commissioner' checked={this.state.oioDetails.authOriginalDesignation === 'Joint Commissioner'} onChange={this.handleChange} required /> Joint Commissioner

                                            <input type='radio' name='authOriginalDesignation' value='Deputy Commissioner' checked={this.state.oioDetails.authOriginalDesignation === 'Deputy Commissioner'} onChange={this.handleChange} required /> Deputy Commissioner

                                            <input type='radio' name='authOriginalDesignation' value='Assistant Commissioner' checked={this.state.oioDetails.authOriginalDesignation === 'Assistant Commissioner'} onChange={this.handleChange} required /> Assistant Commissioner             

                                            <input type='radio' name='authOriginalDesignation' value='Superintendent' checked={this.state.oioDetails.authOriginalDesignation === 'Superintendent'} onChange={this.handleChange} required /> Superintendent
                                        </label>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div className='floating-group'>
                                        <select name='orderType' id='orderType' value={this.state.oioDetails.orderType} className={`floating-input ${this.state.oioDetails.orderType ? 'filled' : '' }`} onChange={this.handleChange} required>
                                            <option value='' disabled hidden></option>
                                            <option value='Demand'>Demand</option>
                                            <option value='Refund'>Refund</option>
                                            <option value='Penality'>Penality</option>
                                            <option value='Cancellation of Registration'>Cancellation of Registration</option>
                                        </select>
                                        <label htmlFor='orderType' className='floating-label'>Select Order Type</label>
                                    </div>
                                </td>
                                <td>
                                    <div className='floating-group'>
                                        <input type='text' name='formation' id="formation" pattern="[A-Za-z_/\-]*" value={this.state.oioDetails.formation} className={`floating-input ${this.state.oioDetails.formation ? 'filled' : "" } `} onChange={this.handleChange} placeholder='Division / Region' required />
                                        <label className='floating-label'>Formation (Division/Region)</label>
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                            <p>Amount under Dispute</p>
                            <tbody>
                            <tr>
                                <td>
                                    <div className='floating-group'>                                        
                                        <input type='number' name='demand' id='demand' value={this.state.oioDetails.demand || ''} className={`floating-input ${this.state.oioDetails.demand ? 'filled' : "" }`} onChange={this.handleChange} placeholder='₹ 0.00 /-'/>
                                        <label htmlFor='demand' className='floating-label'>Demand</label>
                                    </div>
                                </td>
                                <td>
                                    <div className='floating-group'>
                                        <input type='number' name='interest' id='interest' value={this.state.oioDetails.interest || ''} className={`floating-input ${this.state.oioDetails.interest ? 'filled' : "" }`} onChange={this.handleChange} placeholder='₹ 0.00 /-'/>
                                        <label htmlFor='interest' className='floating-label'>Interest</label>
                                    </div>
                                </td>
                                <td>
                                    <div className='floating-group'>
                                        <input type='number' name='penality' id='penality' value={this.state.oioDetails.penality || ''} className={`floating-input ${this.state.oioDetails.penality ? 'filled' : "" }`} onChange={this.handleChange} placeholder='₹ 0.00 /-'/>
                                        <label htmlFor='penality' className='floating-label'>Penalty</label>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div className='floating-group'>                                        
                                        <input type='number' name='lateFee' id='lateFee' value={this.state.oioDetails.lateFee || ''} className={`floating-input ${this.state.oioDetails.lateFee ? 'filled' : "" }`} onChange={this.handleChange} placeholder='₹ 0.00 /-'/>
                                        <label htmlFor='lateFee' className='floating-label'>Late Fee</label>
                                    </div>
                                </td>
                                <td>
                                    <div className='floating-group'>                                        
                                        <input type='number' name='redemtionFine' id='redemtionFine' value={this.state.oioDetails.redemtionFine || ''} className={`floating-input ${this.state.oioDetails.redemtionFine ? 'filled' : "" }`} onChange={this.handleChange} placeholder='₹ 0.00 /-'/>
                                        <label htmlFor='redemtionFine' className='floating-label'>Redemtion Fine</label>
                                    </div>
                                </td>
                                <td>
                                    <div className='floating-group'>
                                        <input type='number' name='refund' id='refund' value={this.state.oioDetails.refund || ''} className={`floating-input ${this.state.oioDetails.refund ? 'filled' : "" }`} onChange={this.handleChange} placeholder='₹ 0.00 /-'/>
                                        <label htmlFor='refund' className='floating-label'>Refund</label>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div className='floating-group'>
                                        <input type='number' name='otherAmount' id='otherAmount' value={this.state.oioDetails.otherAmount} className={`floating-input ${this.state.oioDetails.otherAmount ? 'filled' : '' }`} placeholder='₹ 0.00 /-' onChange={this.handleChange} />
                                        <label htmlFor='otherAmount' className='floating-label'>Any Other Amount</label> 
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>

                        <div className='appeal-amount'>
                            <label htmlFor='totalSum' >Total Amount:</label>
                            <input type='number' name='totalSum' id='totalSum' value={this.state.oioDetails.totalSum || ''} className={`floating-input ${this.state.oioDetails.totalSum ? 'filled' : '' }`} readOnly onChange={this.handleChange} placeholder='₹ 0.00 /-'/>

                            <label htmlFor='amountInWords'>Amount In Words:</label>
                            <input type='text' name='amountInWords' id='amountInWords' value={this.state.oioDetails.amountInWords} className={`floating-input ${this.state.oioDetails.amountInWords ? 'filled' : ''}`} placeholder='Amount in Words' onChange={this.handleChange} />
                        </div>
                        <table className='oioDetails-2'>
                        <tbody>
                            <tr>
                                <td>
                                    <div className='floating-group'>
                                        <input type='number' name='predeposit' id='predeposit' value={this.state.oioDetails.predeposit} className={`floating-input ${this.state.oioDetails.predeposit ? 'filled' : '' }`} placeholder='₹ 0.00 /-' onChange={this.handleChange} />
                                        <label htmlFor='predeposit' className='floating-label'>PreDeposit</label> 
                                    </div>
                                </td>
                                <td>
                                    <div className='floating-group radio-group' style={{marginLeft:'-35%'}}>
                                        <label htmlFor='recievedoioCopy' className='radio-label'> Have you Recieved the OIO Copy : -
                                            <input type='radio' name='recievedoioCopy' id='recievedoioCopy' value='Yes' checked={this.state.oioDetails.recievedoioCopy === 'Yes'} onChange={this.handleChange} required/> Yes 
                                            <input type='radio' name='recievedoioCopy' id='recievedoioCopy' value='No' checked={this.state.oioDetails.recievedoioCopy === 'No'} onChange={this.handleChange} required/> No 
                                        </label>
                                    </div>
                                </td>
                            </tr><br />
                            <tr>
                                <td>
                                    <div className='floating-group'>
                                        <textarea name='issue' id='issue' maxlength='200' className={`floating-input ${this.state.oioDetails.issue ? 'filled' : '' } `} value={this.state.oioDetails.issue}
                                            onChange={ (e) => {
                                                this.handleChange(e);
                                                const remaining = 200 - e.target.value.length;
                                                document.getElementById('charCount').innerText = remaining;
                                            }}
                                            required>
                                        </textarea>
                                        <label htmlFor='issue' className='floating-label'>Issue in Brief (Remaining : <span id='charCount'>200</span> Charaters)</label>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                        </table>

                        {/*Ground of Appeal*/}
                        <h2>Grounds of Appeal</h2>
                        <table className='ground-appeal'>
                        <tbody>
                            <tr>
                                <td>
                                    <div className='floating-group'>
                                        <select id='appealFacts' name='appealFacts' value={this.state.groundAppeal.appealFacts} className={`floating-input ${this.state.groundAppeal.appealFacts ? 'filled' : '' }`} onChange={this.handleChange} required>
                                            <option value='' disabled hidden></option>
                                            <option value='Demand'>Demand</option>
                                            <option value='Cancellation'>Cancellation</option>
                                            <option value='Refund'>Refund</option>
                                            <option value='Rectification'>Rectification</option>
                                        </select>
                                        <label htmlFor='appealFacts' className='floating-label'>Brief Facts of Appeal</label>
                                    </div>
                                </td>
                                <td></td>
                            </tr>
                            <tr>
                                <td>
                                    <div className='floating-group'>
                                        <textarea id='groundsOfAppeal' name='groundsOfAppeal' value={this.state.groundAppeal.groundsOfAppeal} className={`floating-input ${this.state.groundAppeal.groundsOfAppeal ? 'filled' : '' }`} onChange={this.handleChange} ></textarea>
                                        <label htmlFor='groundsOfAppeal' className='floating-label'>Grounds of Appeal (Point-Wise)</label>
                                    </div>
                                    <h5>State your ground for appeal clearly & concisely.Number each ground seperately.</h5>
                                </td>
                                <td>
                                    <div className='floating-group'>
                                        <textarea id='prayer' name='prayer' value={this.state.groundAppeal.prayer} className={`floating-input ${this.state.groundAppeal.prayer ? 'filled' : ''}`} onChange={this.handleChange} ></textarea>
                                        <label htmlFor='prayer' className='floating-label'>Prayer (Relief Sought)</label>
                                    </div>
                                    <h5>Clearly state what relief you are seeking from the Applicant Authority</h5>
                                </td>
                            </tr>
                        </tbody>
                        </table>

                        {/*Docs*/}
                        <h2>Documents Upload</h2>
                        <div className='docs'>
                            <div className='upload-box' 
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => this.handleFileDrop(e,'impugnedOrder')}
                                onClick={() => this.fileInputRef.impugnedOrder.current && this.fileInputRef.impugnedOrder.current.click()}>
                                <label >
                                    <div className='upload-icon'>📤</div>
                                    <div><b>Copy of Impugned Order</b></div>
                                    <small>Copy of Upload (PDF, JPEG, PNG - max 5MB)</small>
                                </label>
                                {this.state.docs.impugnedOrder && (
                                    <div className='file-inline'>
                                        <span>📄 {this.state.docs.impugnedOrder.name}</span>
                                        <span className='file-delete-x' onClick={(e) => {
                                            e.stopPropagation();
                                            this.setState(prevState => ({ docs : { ...prevState.docs, impugnedOrder: null}
                                            }));
                                        }}
                                        title='Remove file'>&nbsp; X </span>
                                    </div>
                                )}
                                <input type='file' id='impugnedOrder' name='impugnedOrder'  ref={this.fileInputRef.impugnedOrder} accept='.pdf,.jpeg,.jpg,.png' onChange={this.handleChange} hidden />
                            </div>

                            <div className='upload-box' 
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => this.handleFileDrop(e,'scnCopy')}
                                onClick={() => this.fileInputRef.scnCopy.current && this.fileInputRef.scnCopy.current.click()}>
                                <label >
                                    <div className='upload-icon'>📤</div>
                                    <div><b>Copy of Show Case Notice(SCN Document)</b></div>
                                    <small>Copy of Upload (PDF, JPEG, PNG - max 5MB)</small>
                                </label>
                                {this.state.docs.scnCopy && (
                                    <div className='file-inline'>
                                        <span>📄 {this.state.docs.scnCopy.name}</span>
                                        <span className='file-delete-x' onClick={(e) => {
                                            e.stopPropagation();
                                            this.setState(prevState => ({ docs : { ...prevState.docs, scnCopy: null}}));
                                        }}
                                        title='Remove file'>&nbsp; X </span>
                                    </div>
                                )}
                                <input type='file' id='scnCopy' name='scnCopy'  ref={this.fileInputRef.scnCopy} accept='.pdf,.jpeg,.jpg,.png' onChange={this.handleChange} hidden />
                            </div>

                            <div className='upload-box' 
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => this.handleFileDrop(e,'predepositPayment')}
                                onClick={() => this.fileInputRef.impugnedOrder.current && this.fileInputRef.impugnedOrder.current.click()}>
                                <label >
                                    <div className='upload-icon'>📤</div>
                                    <div><b>Copy of Pre-Deposit Payment</b></div>
                                    <small>Copy of Upload (PDF, JPEG, PNG - max 5MB)</small>
                                </label>
                                {this.state.docs.predepositPayment && (
                                    <div className='file-inline'>
                                        <span>📄 {this.state.docs.predepositPayment.name}</span>
                                        <span className='file-delete-x' onClick={(e) => {
                                            e.stopPropagation();
                                            this.setState(prevState => ({ docs : { ...prevState.docs, predepositPayment: null}
                                            }));
                                        }}
                                        title='Remove file'>&nbsp; X </span>
                                    </div>
                                )}
                                <input type='file' id='predepositPayment' name='predepositPayment'  ref={this.fileInputRef.predepositPayment} accept='.pdf,.jpeg,.jpg,.png' onChange={this.handleChange} hidden />
                            </div>

                            <div className='upload-box' 
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => this.handleFileDrop(e,'authLetter')}
                                onClick={() => this.fileInputRef.authLetter.current && this.fileInputRef.authLetter.current.click()}>
                                <label >
                                    <div className='upload-icon'>📤</div>
                                    <div><b>Authorization Letter</b></div>
                                    <small>Copy of Upload (PDF, JPEG, PNG - max 5MB)</small>
                                </label>
                                {this.state.docs.authLetter && (
                                    <div className='file-inline'>
                                        <span>📄 {this.state.docs.authLetter.name}</span>
                                        <span className='file-delete-x' onClick={(e) => {
                                            e.stopPropagation();
                                            this.setState(prevState => ({ docs : { ...prevState.docs, authLetter: null}}));
                                        }}
                                        title='Remove file'>&nbsp; X </span>
                                    </div>
                                )}
                                <input type='file' id='authLetter' name='authLetter'  ref={this.fileInputRef.authLetter} accept='.pdf,.jpeg,.jpg,.png' onChange={this.handleChange} hidden />
                            </div>

                            <div className='upload-box' 
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => this.handleFileDrop(e,'supportingDocs')}
                                onClick={() => this.fileInputRef.supportingDocs.current && this.fileInputRef.supportingDocs.current.click()}>
                                <label >
                                    <div className='upload-icon'>📤</div>
                                    <div><b>Additional Supporting Documents</b></div>
                                    <small>Copy of Upload multiple files (PDF, JPEG, PNG - max 5MB)</small>
                                </label>
                                {this.state.docs.supportingDocs && (
                                    <div className='file-inline'>
                                        <span>📄 {this.state.docs.supportingDocs.name}</span>
                                        <span className='file-delete-x' onClick={(e) => {
                                            e.stopPropagation();
                                            this.setState(prevState => ({ docs : { ...prevState.docs, supportingDocs: null }}));
                                        }}
                                        title='Remove file'>&nbsp; X </span>
                                    </div>
                                )}
                                <input type='file' id='supportingDocs' name='supportingDocs'  ref={this.fileInputRef.supportingDocs} accept='.pdf,.jpeg,.jpg,.png' onChange={this.handleChange} hidden />
                            </div>
                        </div>
                    </div>
                    {/* button bars*/}
                    <div className='btn-container'>
                        {/* <button id='doc-export-btn' >Export Details</button> */}
                        <button type='submit' id='appeal-btn'onClick={this.handlePrimaryAction}>{this.state.buttonMode === 'preview' ? 'Preview' : 'Submit' }</button>
                        <Link to='/scrutiny' state={{ appealNo : this.state.applicantInfo.appealNo }}>
                            <button id='appeal-next-btn'>Proceed To Scrutiny</button>
                        </Link>
                    </div>
                </div>
                )}
                                
                
                {/*Reciept Doc*/}
                {this.state.formStage === 'preview' && (
                <div className='preview-overlay'>
                    <div className='Appeal-Reciept-container print-preview-only'>
                        <div className='Appeal-Reciept-header'>
                            {/* <h4>अपील संख्या / Appeal No. {this.state.applicantInfo.appealNo} /{new Date().toLocaleString('en-IN',{year : 'numeric'})}-HYD-GST-ADC</h4> */}
                            <h4>अपील संख्या / Appeal No. {this.state.applicantInfo.appealNo}</h4>
                            <p><b>विषय :- </b>जीएसटी - श्री/श्रीमती {this.state.applicantInfo.legalName} द्वारा, केंद्रीय कर, हैदराबाद जीएसटी मंडल, {this.state.oioDetails.authOriginalDesignation}, जीएसटी डिवीजन, {this.state.oioDetails.formation} द्वारा पारित आदेश-इन-ओरिजिनल संख्या {this.state.oioDetails.oioNo} दिनांक {this.state.applicantInfo.recieptDate} के खिलाफ अपील दायर की गई – प्राप्ति जारी करना - रेज।</p><br />
                            <p><b>Sub :- </b>GST - Appeal filed by Mr./Ms. {this.state.applicantInfo.legalName}, against Order-in-Original No. {this.state.oioDetails.oioNo} / Dt. {this.state.applicantInfo.recieptDate} passed by the {this.state.oioDetails.authOriginalDesignation} of Central Tax, Hyderabad/ADC, GST Division, {this.state.oioDetails.formation}. GST Commissionerate – Issue of Acknowledgment - Reg.</p>
                        </div>
                        <div className='Appeal-Reciept-body'>
                            <h4>अपील का वििरण ननम्नानुसार है / Details of the appeal are as under :-</h4>
                            <table className='Appeal-Reciept-table'>
                                <colgroup>
                                    <col style={{width: '6%'}}></col>
                                    <col style={{width: '47.5%'}}></col>
                                    <col style={{width: '47.5%'}}></col>
                                </colgroup>
                                <tr>
                                    <td>1</td>
                                    <td>अपीलार्थी का नाम एवं पता / Name & Address of the Appellant</td>
                                    <td>
                                        <div className='reciept-data'>
                                            <p>{this.state.applicantInfo.legalName}</p>
                                            <p>{this.state.applicantInfo.taxpayerAddress1}</p>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>2</td>
                                    <td>प्राधिकरण धनणणयन का पता / Address of the Adjudicating Authority</td>
                                    <td>
                                        <p>{this.state.oioDetails.authOriginalDesignation} of Central Tax, HYD / ADC GST Division, {this.state.oioDetails.formation}, GST Commissionerate.</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>3</td>
                                    <td>मूल आदेश की संख्या एवं तारीख धिसके धवरुद्ध अपील दायर धकया गया / Order-In-Original /B.E. No. & Date against which appeal filed</td>
                                    <td>
                                        <p>{this.state.oioDetails.oioNo} / {this.state.oioDetails.orderDate}</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>4</td>
                                    <td>अपीलार्थी को मूल आदेश प्राप्ति की तारीख / Date of service of the Order-In-Original / Date of OOC(as per C.A.-1 form)</td>
                                    <td>
                                        <div className='reciept-options'>
                                            <input type='date' name='occDate' id='occDate' value={this.state.appealReciept.occDate} onChange={this.handleChange}/>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>5</td>
                                    <td>अपील प्राप्ति की तारीख / Date of Receipt of the Appeal</td>
                                    <td>
                                       <div className='reciept-options'>
                                            <input type='date' name='appealRecieptDate' id='appealRecieptDate' value={this.state.appealReciept.appealRecieptDate} onChange={this.handleChange}/>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>6(a)</td>
                                    <td>क्या अपील समय सेदायर धकया है ? / Whether the Appeal is in time ?</td>
                                    <td>
                                        <div className='reciept-options'>
                                            <select htmlFor='appealIsInTime'>Abcds
                                                <option value='' >--- Select an Option ---</option>
                                                <option value='Yes' id='appealISInTime'>Yes</option>
                                                <option value='No' id='appealIsInTime'>No</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>6(b)</td>
                                    <td>यधद नहीं, माफी के धलए धनवेदन दायर धकया या नहीं / If not, request for Condonation of delay filed or not ?</td>
                                    <td>
                                        <div className='reciept-options'>
                                            <select htmlFor='delayRequest'>
                                                <option value='' >--- Select an Option ---</option>
                                                <option value='Yes' id='delayRequest'>Yes</option>
                                                <option value='No' id='delayRequest'>No</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>7</td>
                                    <td>क्या अपील उचित न्याय शुल्क के साथ सही तरीके से प्रस्तुत की गई है और क्या अपील दो प्रतियों में दायर की गई है ? / Whether the Appeal is submitted properly with the requested court fee & whether the appeal is filed in duplicate ?</td>
                                    <td>
                                        <div className='reciept-options'>
                                            <select htmlFor='appealStamp'>
                                                <option value='' >--- Select an Option ---</option>
                                                <option value='Yes' id='appealStamp'>Yes</option>
                                                <option value='No' id='appealStamp'>No</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>8</td>
                                    <td>क्या उस मूल आदेश के साथ, जिसके खिलाफ अपील की गई है, आवश्यक न्यायालय शुल्क संलग्न किया गया है ? / Whether the Order-in-Original against which the appeal is filed has been duly accompanied by the requisite court fee ?</td>
                                    <td>
                                        <div className='reciept-options'>
                                            <select htmlFor='oioStamp'>
                                                <option value='' >--- Select an Option ---</option>
                                                <option value='Yes' id='oioStamp'>Yes</option>
                                                <option value='No' id='oioStamp'>No</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>9(a)</td>
                                    <td>क्या पािी नेअपनी तरफ सेधकसी को प्रधतधनधि के रूपमें प्राधिकृ त धकया हैयधद ऐसा है, तो उसका नाम एवं पता उल्लेख करे ? / Whether the party has Authorized anyone to act as representative ? If so, Mention the Name & Address.</td>
                                    <td>
                                        <div className='reciept-options'>
                                            <select id='authAnyOne' name='authAnyOne' value={this.state.appealReciept.authAnyOne} onChange={this.handleChange}>
                                                <option value='' >--- Select an Option ---</option>
                                                <option value='Yes' id='authAnyOne'>Yes</option>
                                                <option value='No' id='authAnyOne'>No</option>
                                            </select>
                                        </div>
                                        {this.state.appealReciept.authAnyOne && (
                                        <div className='reciept-data'>
                                            {this.state.appealReciept.authAnyOne === 'Yes' && (
                                                <>
                                                    <p>{this.state.applicantInfo.authPersonName}</p>
                                                    <p>{this.state.applicantInfo.taxpayerAddress2}</p>
                                                </>
                                            )}
                                        </div>
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td>9(b)</td>
                                    <td>क्या उसके पक्ष मेंवैि अनुमधत है ? / Whether there is a valid Authorization in his favour ?</td>
                                    <td>
                                        <div className='reciept-options'>
                                            <select htmlFor='authValid'>
                                                <option value='' >--- Select an Option ---</option>
                                                <option value='Yes' id='authValid'>Yes</option>
                                                <option value='No' id='authValid'>No</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>10</td>
                                    <td>शुल्क, दंड एवं िुमाणना का ब्यौरा िो अधिरोधपत धकया गया / Particulars of Demand of Duty, Penalty / Fine Imposed</td>
                                    <td>
                                        <div className='reciept-data'>
                                            <p>Demand - Rs. {this.state.oioDetails.demand} /- , Interset - Rs. {this.state.oioDetails.interest} /- , Penality - Rs. {this.state.oioDetails.penality} /- , Late Fee - Rs. {this.state.oioDetails.lateFee} /- , Redemtion Fine - Rs. {this.state.oioDetails.redemtionFine} /- and Refund - Rs. {this.state.oioDetails.refund} /- .</p>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>11</td>
                                    <td>संधक्षि मेंमुद्दा / Issue in brief </td>
                                    <td>
                                        <div className='reciept-data'>
                                            <p>{this.state.oioDetails.issue}</p>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>12</td>
                                    <td>यधद कॉलम 10 की राधश भुगतान धकया गया है, तो भुगतान का धववरण / Whether the amount in Col.10 paid, if so particulars of payment.</td>
                                    <td>
                                        <div className='reciept-data'>
                                            <p>Pre-Deposit / Tax : - Rs. {this.state.oioDetails.predeposit} /-</p>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>13</td>
                                    <td> क्या धनिी सुनवाई का अनुरोि धकया गया है ? / Whether Personal Hearing requested ?</td>
                                    <td>
                                        <div className='reciept-options'>
                                            <select htmlFor='phRequest'>
                                                <option value='' > --- Select an Option ---</option>
                                                <option value='Yes' id='phRequest'>Yes</option>
                                                <option value='No' id='phRequest'>No</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            <p>अपीलकतासओं को अपील स्िीकार करने, व्यजक्तगत सुनिाई की अनुसूची की सूचना देने और यदद कोई विसंगनतयां हों तो उन्हें सूचचत करने तथा न्यायाचिकरण / जेएसी / जेआरओ को अपील की एक प्रनत संलग्न करने तथा पैरा-िार दटप्पखणयों के साथ केस फाइल / ररकॉिस को अग्रेवषत करने का अनुरोि करने िाले पत्र अिलोकन और अनुमोदन के सलए प्रस्तुत ककए जाते हैं ।</p>
                            <p>Letters to the Appellants acknowledging the Appeal, intimating the schedule of personal hearing and communicating discrepancies noticed if any, and to the adjudicating authority / JAC / JRO enclosing a copy of appeal and requesting to forward case files / records along with Para-wise comments are put up for perusal and approval please.</p>
                        </div>
                        <div className='Appeal-Reciept-fotter'>
                            <h4> इंस्पेक्टर / Inspector </h4>
                            <h4> अिीक्षक / Superintendent </h4>
                        </div>
                    </div>
                    <div className='btn-container'>
                        {/* <button id='appeal-back-btn' onClick={this.handleBack}> Back to Appeal </button> */}
                        <button id='appeal-save-btn' onClick={this.handleSave}> Save </button>
                        <button id='print-reciept-btn' onClick={this.handleDownload}> Print </button>
                    </div>
                </div>
                )}
            </div>

            {/*pop Up for Srutiny*/}
            {this.state.showPopUp && (
            <div className='preview-overlay'>
                <div className='appeal-popup'>
                    <h2>✅ Appeal Submitted Successfully</h2>
                    <p>Would you like to Proceed to the Scrutiny Stage now ?</p>
                    <span className='btn-container'>
                        <Link to='/scrutiny' state={{ appealNo : this.state.applicantInfo.appealNo }}>
                            <button id='popup-yes'>Yes,Proceed to Scrutiny</button>
                        </Link>
                        <button id='popup-no' onClick={this.handleBack}>No,Stay in this Page</button>
                    </span>
                </div>
            </div>
            )}
            </>
        )
    }
}
export default AppealReciept;