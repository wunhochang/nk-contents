-- [GetList]
select
	data.*,
	fn_get_common_type_data('USE_YN', data.use_yn) as use_yn_name,
	fn_get_user_name_by_no(data.insert_user_no) as insert_user_no_name,
	fn_get_user_name_by_no(data.update_user_no) as update_user_no_name
from (
select 
	  a.movie_tag_no
	, a.movie_no
	, a.movie_tag_name
	, a.use_yn
	, a.del_yn
	, a.insert_date
	, a.insert_user_no
	, a.update_date
	, a.update_user_no
	, a.delete_date
	, a.delete_user_no
	, b.movie_name
	, (select count(*) from movie_tag a inner join movie b on a.movie_no = b.movie_no where 1=1 and a.del_yn='N' {IN_STR}) as total_count
from movie_tag a inner join movie b on a.movie_no = b.movie_no
where 1=1 and a.del_yn = 'N'
    {IN_STR}
) data
{IN_ORDER_BY}
{IN_LIMIT}
;

-- [GetComboList]
select
	  a.movie_tag_no
	, a.movie_no
	, a.movie_tag_name
	, a.use_yn
	, a.del_yn
	, a.insert_date
	, a.insert_user_no
	, a.update_date
	, a.update_user_no
	, a.delete_date
	, a.delete_user_no
	, b.movie_name
from movie_tag a inner join movie b on a.movie_no = b.movie_no
where 1=1 and a.del_yn = 'N' and a.use_yn = 'Y'
order by a.movie_tag_name asc
;

-- [CheckMovieCount]
select count(*) from movie_tag 
where movie_no = :movie_no 
	and movie_tag_name = :movie_tag_name
	and use_yn = 'Y'
	and del_yn = 'N'
;

-- [Insert]
insert into movie_tag(
	  movie_tag_no
	, movie_no
	, movie_tag_name
	, insert_user_no
	, insert_date
	, update_user_no
	, update_date
)
values(
	  :movie_tag_no
	, :movie_no
	, :movie_tag_name
	, :oper_user_no
	, current_timestamp
	, :oper_user_no
	, current_timestamp
);

-- [Update]
update movie_tag set
	  movie_no		= :movie_no         
	, movie_tag_name	= :movie_tag_name   
	, update_user_no	= :oper_user_no     
	, update_date		= current_timestamp 
where movie_tag_no = :movie_tag_no
;

-- [movie_tag_update]
update movie_tag set 
	  movie_tag_name	= :movie_tag_name  
	, update_user_no	= :oper_user_no     
	, update_date		= current_timestamp 
where movie_no = :movie_no
	and movie_tag_name = :old_movie_tag_name;

-- [Delete]
update movie_tag set
	  use_yn		= 'N'     
	, del_yn		= 'Y'         
	, delete_user_no	= :oper_user_no     
	, delete_date		= current_timestamp 
where movie_tag_no = :movie_tag_no
;