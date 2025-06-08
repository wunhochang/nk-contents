using System;
using System.Net;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using GAPI.Entity;
using Newtonsoft.Json;
using System.Collections;
using System.Net;
using Microsoft.AspNetCore.Authorization;
using GAPI.Entity.Common;
using Microsoft.Extensions.Logging;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using GAPI.Common;
using System.Net.Mail;  

namespace GAPI.Controllers
{
    [Route("api/CpAccountingReport/[action]")]
    public class CpAccountingReportActionController : GController
    {
        private const string XlsxContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        private readonly IHostingEnvironment _hostingEnvironment;

        private new APIResult result = new APIResult();
        public CpAccountingReportActionController(IHostingEnvironment hostingEnvironment)
        {
            _hostingEnvironment = hostingEnvironment;
        }

        [HttpGet]
        [Authorize]
        [ActionName("GetList")]
        public APIResult GetList(string condition, int page, int start, int limit, [FromQuery]string sort)
        {
            try
            {
                CheckAuthNLogging(condition, "Get");

                var hsCondition = new Hashtable();
                /*검색조건 처리부분*/
                if (!string.IsNullOrWhiteSpace(condition))
                {
                    hsCondition = JsonConvert.DeserializeObject<Hashtable>(condition);
                }
                CpAccountingReport.GetList(hsCondition, ref result);

                  result.Success = true;
            }
            catch (Exception ex)
            {
                if (Response.StatusCode == 200) Response.StatusCode = 500;

                result.Success = false;
                result.Errors.Add(new Error("EX", ex.ToString()));
            }

            return result;
        }

        [HttpGet]
        [Authorize]
        [ActionName("GetCpAccountingReport")]
        public APIResult GetCpAccountingReport(string condition, int page, int start, int limit, [FromQuery]string sort)
        {
            try
            {
                CheckAuthNLogging(condition, "Get");

                var hsCondition = new Hashtable();
                /*검색조건 처리부분*/
                if (!string.IsNullOrWhiteSpace(condition))
                {
                    hsCondition = JsonConvert.DeserializeObject<Hashtable>(condition);
                }
                CpAccountingReport.GetCpAccountingReport(hsCondition, ref result);

                result.Success = true;
            }
            catch (Exception ex)
            {
                if (Response.StatusCode == 200) Response.StatusCode = 500;

                result.Success = false;
                result.Errors.Add(new Error("EX", ex.ToString()));
            }

            return result;
        }

        [HttpPost]
       // [Authorize]
        [ActionName("Save")]
        public APIResult Save([FromBody]string value)
        {
            try
            {
                CheckAuthNLogging(value, "Post");

                string jsonData = value;

                Hashtable data = JsonConvert.DeserializeObject<Hashtable>(jsonData);
                AddDefaultParams(data);
                Decimal id = 0;
                Decimal iid = 0;
                Decimal settlement_amt = 0;

                var settlement_month = "";
                var DB = Config.GetDatabase();
                if (data["cp_accounting_report"] != null && data["cp_accounting_report"].ToString() != "")
                {
                    List<Hashtable> cp_accounting_report = JsonConvert.DeserializeObject<List<Hashtable>>(data["cp_accounting_report"].ToString());
                    /*SP사 정산영화 마감처리*/
                    id = new CpAccountingReport().CpConfirm(data);
                    /*CP사 영화정산 처리*/

                    var nid = DB.GetNextSeq("cp_pre_pay");
                    foreach (var item in cp_accounting_report)
                    {
                        AddDefaultParams(item);
                        
                        

                        if (item["total_pay_price"] != null && item["total_pay_price"].ToString() != "")
                        {
                            settlement_amt += decimal.Parse(item["total_pay_price"].ToString());;
                        }

                        if (item["settlement_date"] != null && item["settlement_date"].ToString() != "")
                        {
                            settlement_month = item["settlement_date"].ToString();
                        }
                        
                        if(item["movie_name"].ToString() == "선급이월액"){
                            //Console.WriteLine("1  "+item["movie_name"]);
                            item["cp_pre_pay_no"] = nid;
                            
                            item["settlement_amt"] = settlement_amt;
                            item["settlement_month"] = settlement_month;
                            item["prepay_date"] = DateTime.Now.ToString("yyyy-M-d");

                            iid += new CpPrePay().CpPrePayConfirm(item);// CpAccountingReport().Insert(item);
                        }else{
                            Console.WriteLine("21  "+item["movie_name"]);
                            
                            id += new CpAccountingReport().Insert(item);
                            // await _context.SaveChangesAsync(); // Doesn't work
                            
                        }

                    }
                }
                result.Success = true;
                result.NewID = id;
            }
            catch (Exception ex)
            {
                if (Response.StatusCode == 200) Response.StatusCode = 500;

                result.Success = false;
                result.Errors.Add(new Error("EX", ex.ToString()));
            }

            return result;
        }

        [HttpPost]
        [Authorize]
        [ActionName("Cancel")]
        public APIResult Cancel([FromBody]string value)
        {
            try
            {
                CheckAuthNLogging(value, "Post");

                string jsonData = value;

                Hashtable data = JsonConvert.DeserializeObject<Hashtable>(jsonData);
                AddDefaultParams(data);
                Decimal iid = new CpPrePay().CpPrePayCancel(data);
                Decimal id = id = new CpAccountingReport().Cancel(data);
                result.Success = true;
                result.NewID = id;
            }
            catch (Exception ex)
            {
                if (Response.StatusCode == 200) Response.StatusCode = 500;

                result.Success = false;
                result.Errors.Add(new Error("EX", ex.ToString()));
            }

            return result;
        }

        [HttpPost]
       // [Authorize]
        [ActionName("MailSend")]
        public APIResult MailSend([FromBody]string value)
        {
            try
            {
                // var hsCondition = new Hashtable();
                // if (!string.IsNullOrWhiteSpace(value))
                // {
                //     hsCondition = JsonConvert.DeserializeObject<Hashtable>(value);
                // }
                var reportsFolder = "reports";
                var attachfileName="";
                var DB = Config.GetDatabase();
                string rvalue =  value.Replace("\\n", "\n").Replace("\\r", "\r").Replace("\\t", "\t");

                var hsCondition = new Hashtable();
                if (!string.IsNullOrWhiteSpace(rvalue))
                {
                    hsCondition = JsonConvert.DeserializeObject<Hashtable>(rvalue);
                }
                //ReplaceEscapeChar

                
                MailMessage mail = new MailMessage();
            
                SmtpClient SmtpServer = new SmtpClient("smtp.gmail.com");                    //set the address  tax_email       
                mail.From = new MailAddress("soyeon@nkcontents.co.kr");                  
                mail.To.Add(hsCondition["to_email"].ToString());                    //set the contents            soyeon@nkcontents.co.kr       

                if (hsCondition["cc_email"] != null && DBUtils.DataToString(hsCondition["cc_email"]) != "")
                {
                    string[] CCId = hsCondition["cc_email"].ToString().Split(',');  
                    foreach (string CCEmail in CCId)  
                    {  
                        mail.CC.Add(new MailAddress(CCEmail)); //Adding Multiple CC email Id  
                    }  
                }

               // mail.CC.Add("whchang@gen-one.com");


                mail.Subject =hsCondition["mail_title"].ToString();//"Subject Test Mail";                  
                mail.Body = System.Net.WebUtility.HtmlDecode(hsCondition["remark"].ToString());
                
                mail.IsBodyHtml = true;             
                mail.BodyEncoding = System.Text.Encoding.UTF8;                  
                mail.SubjectEncoding = System.Text.Encoding.UTF8;                    //set attachment                  
                System.Net.Mail.Attachment attachment;      
                            
               // attachment = new System.Net.Mail.Attachment("C:\\nk-contents\\GAPI\\wwwroot\\reports\\"+hsCondition["excelname"].ToString()+".xlsx");   
                attachfileName = hsCondition["excelname"].ToString()+".xlsx";  
                var finfo = new FileInfo(Path.Combine(_hostingEnvironment.WebRootPath, reportsFolder, attachfileName));
                
                attachment = new System.Net.Mail.Attachment(finfo.ToString());          
                mail.Attachments.Add(attachment);                    //setting smtpServer                  
                SmtpServer.Port = 587;                  
                SmtpServer.Credentials = new System.Net.NetworkCredential("nkcontents.vod@gmail.com", "dszp egcv qlgx fmej");                  
                SmtpServer.EnableSsl = true;                    //SmtpServer.Send(mail);                  // MessageBox.Show("mail Send"); tfrr npso dvgl wtib   dszp egcv qlgx fmej                //async send mail                  
                SmtpServer.Send(mail);
                
    
                var nid = DB.GetNextSeq("mail_send_log");
                
                hsCondition["mail_send_log_no"] = nid;
                hsCondition["attach_file"] = attachfileName;
                Decimal iid = new CpPrePay().MailSendLog(hsCondition);


                result.NewID = iid;         
            }
            catch (Exception ex)
            {
                //MessageBox.Show(ex.ToString());              
                result.Success = false;
                //Console.WriteLine(new Error("EX", ex.ToString()));
                result.Errors.Add(new Error("EX", ex.ToString()));
            }

            return result;      
        }


        [HttpGet]
        //[Authorize]
        [ActionName("GetCpAccountingReportExcelDownload")]
        public IActionResult GetCpAccountingReportExcelDownload(string condition)
        {
            //CheckAuthNLogging(value);
            var hsCondition = new Hashtable();
            if (!string.IsNullOrWhiteSpace(condition))
            {
                hsCondition = JsonConvert.DeserializeObject<Hashtable>(condition);
            }
            List<Hashtable> excelcolumns = new List<Hashtable>();
            if (hsCondition["excelcolumns"] != null && DBUtils.DataToString(hsCondition["excelcolumns"]) != "")
            {
                excelcolumns = JsonConvert.DeserializeObject<List<Hashtable>>(hsCondition["excelcolumns"].ToString());
            }

            CpAccountingReport.GetCpAccountingReport(hsCondition, ref result);
            List<Hashtable> list = (List<Hashtable>)result.Data;
            DateTime now = DateTime.Now;
            string this_date = now.ToString("yyyyMMddTHHmmssfff");

            var fileDownloadName = "data.xlsx";
            var reportsFolder = "reports";

            if (hsCondition["excelname"] != null && DBUtils.DataToString(hsCondition["excelname"]) != "")
            {
                fileDownloadName = hsCondition["excelname"] + "_" + this_date + ".xlsx";
            }
            else
            {
                fileDownloadName = "RAWDATA_" + this_date + ".xlsx";
            }

            ExcelMakeEntity excelMakeEntity = new ExcelMakeEntity();

            using (var package = excelMakeEntity.createExcelPackage(list, excelcolumns))
            {
                package.SaveAs(new FileInfo(Path.Combine(_hostingEnvironment.WebRootPath, reportsFolder, fileDownloadName)));
            }
            result.Success = true;

            return File($"~/{reportsFolder}/{fileDownloadName}", XlsxContentType, fileDownloadName);

        }
    }
}
