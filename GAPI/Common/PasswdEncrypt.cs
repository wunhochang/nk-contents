//using CryptSharp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GAPI.Common
{
    /// <summary>
    /// 비밀번호 암호화 클래스
    /// BCrypt 방법을 사용
    ///     비밀번호 전용으로 Decrypt 가 없고 
    ///     원문자열과 비교만 가능
    /// </summary>
    public class PasswdEncrypt
    {
        /// <summary>
        /// 암호화
        /// </summary>
        /// <param name="passwd">암호화할 비밀번호</param>
        /// <returns>암호화된 문자열</returns>
        public static string Encrypt(string passwd)
        {
            string encrypted = BCrypt.Net.BCrypt.HashPassword(passwd);
            //string encrypted = Crypter.Blowfish.Crypt(passwd);

            //string salt = BCryptHelper.GenerateSalt();

            //string encrypted = BCryptHelper.HashPassword(passwd, salt);

            return encrypted;
        }

        /// <summary>
        /// 암호화된 문자열과 비밀번호가 일치하는 지 확인
        /// </summary>
        /// <param name="passwd">비교할 비밀번호</param>
        /// <param name="encrypted">암호화된 문자열</param>
        /// <returns></returns>
        public static bool Check(string passwd, string encrypted)
        {
            //return BCryptHelper.CheckPassword(passwd, encrypted);
            //return Crypter.CheckPassword(passwd, encrypted);
            return BCrypt.Net.BCrypt.Verify(passwd, encrypted);
        }
    }
}
