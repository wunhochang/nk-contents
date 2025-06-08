-- [GetList]
select 
    b.sp_corp_no
  , b.sp_corp_name
from cp_to_sp_corp_group a left join sp_corp b
on a.sp_corp_no = b.sp_corp_no
where a.cp_corp_detail_no = :cp_corp_detail_no
  and b.use_yn = 'Y'
  and b.del_yn = 'N'
 {IN_STR} 
order by b.sp_corp_name asc;  

-- [GetSpCorpList]
select 
    sp_corp_no
  , sp_corp_name
from sp_corp
where use_yn = 'Y'
  and del_yn = 'N'
  and sp_corp_no not in ( select sp_corp_no from cp_to_sp_corp_group where cp_corp_detail_no = :cp_corp_detail_no)
  {IN_STR} 
order by sp_corp_name asc;

-- [Insert]
insert into cp_to_sp_corp_group(
	  cp_to_sp_corp_group_no
	, cp_corp_detail_no
	, sp_corp_no
)
values (
	  :cp_to_sp_corp_group_no
	, :cp_corp_detail_no
	, :sp_corp_no
);

-- [Delete]
delete from cp_to_sp_corp_group
where cp_corp_detail_no = :cp_corp_detail_no;
