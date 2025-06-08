-- [GetControllerNoByName]
SELECT controller_no,
       controller_code,
       controller_name,
       output_order,
       use_yn,
       del_yn,
       insert_user_no,
       insert_date,
       update_user_no,
       update_date,
       delete_user_no,
       delete_date
FROM controller
WHERE controller_name = :controller_name
;

-- [List]
SELECT controller_no,
       controller_code,
       controller_name,
       output_order,
       use_yn,
       del_yn,
       insert_user_no,
       insert_date,
       update_user_no,
       update_date,
       delete_user_no,
       delete_date
FROM controller;
WHERE use_yn = :use_yn
  AND del_yn = :del_yn
  AND  CASE
             WHEN :controler_no IS NULL OR :controler_no = '' THEN 1
             ELSE :controler_no = controller_no
          END
;

-- [Insert]
INSERT INTO controller(controller_no,
                  controller_code,
                  controller_name,
                  insert_user_no)
VALUES (:controler_no,
        :controller_code,
        :controller_name,
		:oper_user_no
        );


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