using ExcelDataReader;
using GAPI.Common;
using GAPI.Entity.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Text;
using System.Threading.Tasks;
// using ImageSharp;
// using ImageSharp.Processing;
// using ImageSharp.Formats;
using System.Collections;

namespace GAPI.Controllers
{
    [Route("api/Upload/[action]")]
    public class UploadController : GController
    {
        [HttpPost]
        [Authorize]
        [ActionName("Upload")]
        public async Task<APIResult> Upload(ICollection<IFormFile> files)
        {
            try
            {
                CheckAuthNLogging("", "Upload");
                var save_files = new List<GFileInfo>();
                var user_id = User.Identity.Name;

                foreach (var file in files)
                {
                    if (file.Length > 0)
                    {
                        // 일단 temp 디렉토리에 저장하자.
                        var temp_path = Path.GetTempFileName();

                        // 저장
                        using (var fileStream = new FileStream(temp_path, FileMode.Create))
                        {
                            await file.CopyToAsync(fileStream);
                        }
                                                
                        // 파일정보 새로 생성하고
                        var _f = new GFileInfo();
                        _f.TempPath = temp_path;
                        _f.FileName = file.FileName;
                        _f.Size = file.Length;

                        // 새로운 풀 경로 만들고
                        FileUtils.CheckNCreatePath(_f.DirectoryPath);

                        // 파일을 복사한다.
                        FileUtils.FileCopy(_f.TempPath, _f.FullPath);

                        // if(_f.IsImageFile)
                        // {
                        //     FileUtils.MakeThumbnail(_f.FullPath, _f.ThumbnailPath);
                        // }

                        save_files.Add(_f);
                    }
                }

                // DB 에 저장 후 
                foreach (var _f in save_files)
                {
                    Hashtable data = new Hashtable();
                    data["filee_name"] = _f.FileName;
                    data["save_path"] = _f.FullPath;
                    data["filee_size"] = _f.Size;
                    data["type"] = _f.Ext;
                    data["save_path"] = _f.FullPath;
                    data["thumbnail_path"] = _f.ThumbnailPath;

                    AddDefaultParams(data);

                    _f.FileNo = (entity as Entity.Upload).InsertFile(data);
                }

                // 결과 돌려줌
                result.Data = save_files;
                result.count = save_files.Count;
                result.Success = true;
            }
            catch(Exception ex)
            {
                if (Response.StatusCode == 200) Response.StatusCode = 500;

                result.Success = false;
                result.Errors.Add(new Error("EX", ex.ToString()));
            }

            return result;
        }

        [HttpPost]
        [Authorize]
        [ActionName("UploadExcel")]
        public async Task<APIResult> UploadExcel(ICollection<IFormFile> files)
        {
            try
            {
                CheckAuthNLogging("", "Upload");
                var save_files = new List<GFileInfo>();

                //List<List<object>> table = new List<List<object>>();
                //var row = new List<object>();
                List<Hashtable> table = new List<Hashtable>();

                foreach (var file in files)
                {
                    if (file.Length > 0)
                    {
                        // 일단 temp 디렉토리에 저장하자.
                        var temp_path = Path.GetTempFileName();

                        // 저장
                        using (var fileStream = new FileStream(temp_path, FileMode.Create))
                        {
                            await file.CopyToAsync(fileStream);
                        }

                        // 파일정보 새로 생성하고
                        var _f = new GFileInfo();
                        _f.TempPath = temp_path;
                        _f.FileName = file.FileName;

                        // 새로운 풀 경로 만들고
                        FileUtils.CheckNCreatePath(_f.DirectoryPath);

                        // 파일을 복사한다.
                        FileUtils.FileCopy(_f.TempPath, _f.FullPath);

                        save_files.Add(_f);

                        // Excel 읽기 기능 추가
                        //using (var stream = new FileStream(_f.FileName, FileMode.Open))
                        using (var stream = new FileStream(_f.FullPath, FileMode.Open))
                        {

                            System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);

                            // Auto-detect format, supports:
                            //  - Binary Excel files (2.0-2003 format; *.xls)
                            //  - OpenXml Excel files (2007 format; *.xlsx)
                            using (var reader = ExcelReaderFactory.CreateReader(stream, new ExcelReaderConfiguration()
                            {

                                // Gets or sets the encoding to use when the input XLS lacks a CodePage 
                                // record. Default: cp1252. (XLS BIFF2-5 only)
                                FallbackEncoding = Encoding.GetEncoding(949)
                                //FallbackEncoding = Encoding.GetEncoding(1252)
                                //FallbackEncoding = Encoding.GetEncoding("utf-8")
                            }))
                            {

                                // Choose one of either 1 or 2:

                                // 1. Use the reader methods
                                int rowidx = 0;
                                do
                                {
                                    while (reader.Read())
                                    {
                                        int idx = 1;
                                        if(rowidx>0)
                                        {
                                            Hashtable hs = new Hashtable();
                                            for (int i = 0; i < reader.FieldCount; i++)
                                            {
                                                string idx_str = "" + idx;
                                                if (idx < 10)
                                                {
                                                    idx_str = "0" + idx;
                                                }
                                                string strValue = "";
                                                if(reader.GetValue(i) != null && (string)reader.GetValue(i).ToString() != "")
                                                {
                                                    strValue = (string)reader.GetValue(i).ToString().Trim();
                                                }
                                                    
                                                hs.Add("col_" + idx_str, strValue);
                                                //hs.Add("col_" + idx_str, reader.GetValue(i));
                                                idx++;
                                            }
                                            table.Add(hs);

                                            //table.Add(row);
                                        }
                                        rowidx++;
                                    }
                                } while (reader.NextResult());
                            }
                        }

                        // DB 에 저장 후 
                        System.IO.FileInfo fi = new System.IO.FileInfo(_f.FullPath);
                        try
                        {
                            fi.Delete();
                        }
                        catch (System.IO.IOException e)
                        {
                            Console.WriteLine(e.Message);
                        }
                    }
                }

                // 결과 돌려줌
                result.Data = table;
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
    }
}
