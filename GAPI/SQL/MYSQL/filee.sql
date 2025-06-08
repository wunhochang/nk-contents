-- [Insert]
INSERT INTO filee(
   filee_no
  ,filee_name
  ,save_path
  ,filee_size
  ,type
  ,content
  ,meta_data
  ,thumbnail_path
  ,upload_folder
  ,ref_key
  ,temp_yn
  ,insert_user_no
  ,insert_datetime
) VALUES (
   :filee_no
  ,:filee_name
  ,:save_path
  ,:filee_size
  ,:type
  ,:content
  ,:meta_data
  ,:thumbnail_path
  ,:upload_folder
  ,:ref_key
  ,:temp_yn
  ,:oper_user_no
  ,current_timestamp
);

-- [UpdateRef]
UPDATE filee 
SET upload_folder = :upload_folder,
	ref_key = :ref_key,
	temp_yn = :temp_yn,
	update_user_no = :oper_user_no,
	update_datetime = current_timestamp
WHERE filee_no = :filee_no
;