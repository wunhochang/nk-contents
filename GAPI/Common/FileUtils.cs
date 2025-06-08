// using ImageSharp;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace GAPI.Common
{
    public class FileUtils
    {

        // public static void MakeThumbnail(string inputPath, string outputPath, int size = 150, int quality = 75)
        // {
        //     var fi = new FileInfo(outputPath);

        //     CheckNCreatePath(fi.DirectoryName);

        //     using (Image<Rgba32> image = ImageSharp.Image.Load(inputPath))
        //     {
        //         image.Resize(size, size)
        //              //.Grayscale()                     
        //              .Save(outputPath); // automatic encoder selected based on extension.
        //     }
        // }

        public static void FileCopy(string tempPath, string fullPath)
        {
            System.IO.File.Copy(tempPath, fullPath);
        }

        public static void CheckNCreatePath(string directoryPath)
        {
            if (Directory.Exists(directoryPath) == false)
                Directory.CreateDirectory(directoryPath);
        }

    }
}
