set heading;
set list;
select D.OPIS as Del, S.OPIS as Opis, Z.OPIS as Znamka, M.OPIS as Model, S.CAS_VNOSA as Vnos, S.CAS_IZNOSA as Iznos from SKLADISCE S, AVTO_DEL D, AVTO_MODEL M, AVTO_ZNAMKA Z where S.ID_AVTO=M.AUTONUM and M.ID_ZNAMKA=Z.AUTONUM and S.ID_AVTO_DEL=D.AUTONUM and S.CAS_IZNOSA is not NULL order by S.CAS_IZNOSA descending, Z.OPIS, M.OPIS;