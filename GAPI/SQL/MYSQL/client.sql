-- [UpdateToken]
UPDATE client
SET token = :token,
	update_date = current_timestamp
WHERE client_no = :client_no
;

-- [InfoRefreshToken]
select 
	  a.client_no
	, a.token
	, a.user_id
	, a.insert_date
	, b.user_no
from client a 
inner join user b 
on a.user_id = b.user_id
where a.use_yn = :use_yn
  and a.del_yn = :del_yn
  and a.token = :token
;

-- [Info]
SELECT client_no,
       token,
       user_id,
       use_yn,
       del_yn,
       insert_user_no,
       insert_date,
       update_user_no,
       update_date,
       delete_user_no,
       delete_date
FROM client
WHERE use_yn = :use_yn
  AND del_yn = :del_yn
  AND  CASE
             WHEN :client_no IS NULL OR :client_no = '' THEN 1
             ELSE :client_no = client_no
          END
  AND  CASE
             WHEN :token IS NULL OR :token = '' THEN 1
             ELSE :token = token
          END
;

-- [List]
SELECT client_no,
       token,
       user_id,
       use_yn,
       del_yn,
       insert_user_no,
       insert_date,
       update_user_no,
       update_date,
       delete_user_no,
       delete_date
FROM client
WHERE use_yn = :use_yn
  AND del_yn = :del_yn
  AND  CASE
             WHEN :client_no IS NULL OR :client_no = '' THEN 1
             ELSE :client_no = client_no
          END
;

-- [Insert]
INSERT INTO client(client_no,
                   token,
                   user_id,
                   insert_user_no)
VALUES (:client_no,
        :token,
        :user_id,
        '1');


-- [InfoByToken]    
SELECT client_no,
       token,
       user_id,
       use_yn,
       del_yn,
       insert_user_no,
       insert_date,
       update_user_no,
       update_date,
       delete_user_no,
       delete_date
FROM client
WHERE token = :token
;

-- [UpdateUpdateTime]
UPDATE client
SET update_date = current_timestamp
WHERE token = :token
;
-- [GetClientNoByToken]
SELECT client_no,
       token,
       user_id,
       use_yn,
       del_yn,
       insert_user_no,
       insert_date,
       update_user_no,
       update_date,
       delete_user_no,
       delete_date
FROM client
WHERE token = :token