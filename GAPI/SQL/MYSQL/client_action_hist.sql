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
WHERE client_no = :client_no
;
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
INSERT INTO client_action_hist(client_action_hist_no,
                               client_no,
                               controller_no,
							   user_no,
                               action,
							   param,
							   auth_result,
                               insert_user_no)
VALUES (:client_action_hist_no,
        :client_no,
        :controller_no,
		:user_no,
        :action,
		:param,
		:auth_result,
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
SET update_datetime = current_timestamp
WHERE token = :token
;