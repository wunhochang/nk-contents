-- [GetList]
select
	  a.televising_right_no
	, a.movie_no
	, a.sp_corp_name
	, a.sales_gubun
	, a.sales_st_date
	, a.sales_ed_date
	, a.sales_period
	, a.sales_price
	, a.gubun
	, a.remark
	, a.use_yn
	, a.del_yn
	, a.insert_user_no
	, a.insert_date
	, a.update_user_no
	, a.update_date
	, a.delete_user_no
	, a.delete_date
	, b.movie_name
	, b.publication_ed_date
	, fn_get_common_type_data('TELEVISING_RIGHT_MOVIE_GUBUN', a.sales_gubun) as sales_gubun_name
	, fn_get_common_type_data('USE_YN', a.use_yn) as use_yn_name
	, fn_get_user_name_by_no(a.insert_user_no) as insert_user_no_name
	, fn_get_user_name_by_no(a.update_user_no) as update_user_no_name
from televising_right_hist a left join movie b
on a.movie_no = b.movie_no
where 1=1
  and a.use_yn = 'Y'
  and a.del_yn = 'N'
  and a.televising_right_no = :televising_right_no
order by a.update_date desc
;

-- [Insert]
insert into televising_right_hist(
	  televising_right_hist_no
	, televising_right_no
	, movie_no
	, sp_corp_name
	, sales_gubun
	, sales_st_date
	, sales_ed_date
	, sales_period
	, sales_price
	, gubun
	, remark
	, use_yn
	, del_yn
	, insert_user_no
	, insert_date
	, update_user_no
	, update_date
	, delete_user_no
	, delete_date
	, bak_insert_user_no
	, bak_insert_date
)
select
	  :televising_right_hist_no
	, televising_right_no
	, movie_no
	, sp_corp_name
	, sales_gubun
	, sales_st_date
	, sales_ed_date
	, sales_period
	, sales_price
	, gubun
	, remark
	, use_yn
	, del_yn
	, insert_user_no
	, insert_date
	, update_user_no
	, update_date
	, delete_user_no
	, delete_date
	, :oper_user_no
	, sysdate()
from televising_right
where televising_right_no = :televising_right_no;
