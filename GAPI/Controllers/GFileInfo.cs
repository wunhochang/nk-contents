
using GAPI.Common;
using System;
using System.IO;

namespace GAPI.Controllers
{
    public class GFileInfo
    {
        private string upload_path;

        private string file_name;
        private string save_file_name;

        private FileInfo fi;

        public GFileInfo()
        {
            upload_path = Config.GetUploadPath();            
        }

        public string DirectoryPath { get { return fi.DirectoryName; } }

        public string FullPath { get { return fi.FullName; } }

        public string TempPath { get; internal set; }

        public string FileName {
            get
            {
                return file_name;
            }

            internal set
            {
                file_name = value;

                var tfi = new FileInfo(upload_path + "/" + file_name);
                save_file_name = Guid.NewGuid().ToString() + tfi.Extension;

                fi = new FileInfo(upload_path + "/" + save_file_name);
            }
        }

        public bool IsImageFile {
            get
            {
                if (fi.Extension.ToLower() == ".jpg"
                    || fi.Extension.ToLower() == ".png"
                    || fi.Extension.ToLower() == ".gif"
                    || fi.Extension.ToLower() == ".bmp"
                    )
                {
                    ThumbnailPath = fi.Directory.FullName + "/Thumbnail/" + fi.Name;
                    ThumbnailPath = ThumbnailPath.Replace(fi.Extension, ".png");

                    return true;
                }
                else
                    return false;
            }
        }

        public string ThumbnailPath { get; internal set; }
        public long Size { get; internal set; }
        public string Ext {
            get
            {
                return fi.Extension;
            }
        }

        public decimal FileNo { get; internal set; }
    }
}